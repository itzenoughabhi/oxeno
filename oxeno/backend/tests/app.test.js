import assert from "node:assert/strict";
import test, { after } from "node:test";
import supertest from "supertest";

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret-that-is-long-enough-to-sign-access-tokens";
process.env.DATABASE_URL = "postgresql://test:test@127.0.0.1:5432/oxeno_test";

const [{ default: app }, { closeDatabase }, { createAccessToken }] = await Promise.all([
  import("../server/app.js"),
  import("../server/db.js"),
  import("../server/services/tokenService.js"),
]);

const request = supertest(app);

after(async () => {
  await closeDatabase();
});

test("unknown routes return the API's JSON 404 response", async () => {
  const response = await request.get("/api/missing").expect(404);

  assert.deepEqual(response.body, { error: "Route not found." });
  assert.equal(response.headers["x-content-type-options"], "nosniff");
});

test("invalid JSON is rejected before reaching a controller", async () => {
  const response = await request
    .post("/api/auth/login")
    .set("Content-Type", "application/json")
    .send("{invalid")
    .expect(400);

  assert.deepEqual(response.body, { error: "Request body must be valid JSON." });
});

test("CORS preflight permits the dashboard bearer token header", async () => {
  const response = await request
    .options("/api/customer-dashboard")
    .set("Origin", "http://localhost:5173")
    .set("Access-Control-Request-Method", "GET")
    .set("Access-Control-Request-Headers", "authorization,content-type")
    .expect(204);

  assert.equal(response.headers["access-control-allow-origin"], "http://localhost:5173");
  assert.match(response.headers["access-control-allow-headers"], /authorization/i);
});

test("authenticated routes validate the Bearer token", async () => {
  const token = createAccessToken({
    user: { id: "6de56141-9d93-4c0d-9f27-d36e0e9ff4c5", role: "owner" },
    business: { id: "93c3dbb8-feba-40c9-a40b-5b05a05bf3c5" },
  });

  const response = await request
    .get("/api/auth/me")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.equal(response.body.auth.sub, "6de56141-9d93-4c0d-9f27-d36e0e9ff4c5");
  assert.equal(response.body.auth.role, "owner");
});

test("dashboard data is available for authenticated businesses", async () => {
  const token = createAccessToken({
    user: { id: "6de56141-9d93-4c0d-9f27-d36e0e9ff4c5", role: "owner" },
    business: { id: "93c3dbb8-feba-40c9-a40b-5b05a05bf3c5" },
  });

  const response = await request
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${token}`)
    .expect(200);

  assert.ok(Array.isArray(response.body.stats));
  assert.ok(Array.isArray(response.body.upcomingBirthdays));
  assert.ok(Array.isArray(response.body.upcomingAnniversaries));
  assert.ok(Array.isArray(response.body.activeCampaigns));
  assert.ok(response.body.subscription);
  assert.ok(Array.isArray(response.body.usage));
});

test("customer dashboard requires a customer access token", async () => {
  const response = await request.get("/api/customer-dashboard").expect(401);

  assert.equal(response.body.code, "missing_token");
});

test("customer access tokens cannot read the business dashboard", async () => {
  const token = createAccessToken({
    user: { id: "d20f2898-27c8-46d1-9ae4-f9204d79a457", role: "customer" },
    business: { id: "93c3dbb8-feba-40c9-a40b-5b05a05bf3c5" },
  });

  const response = await request
    .get("/api/dashboard")
    .set("Authorization", `Bearer ${token}`)
    .expect(403);

  assert.equal(response.body.code, "forbidden");
});

test("business loyalty actions require an authenticated business user", async () => {
  const response = await request.get("/api/dashboard/loyalty-options").expect(401);

  assert.equal(response.body.code, "missing_token");
});

test("business loyalty actions validate point awards before database access", async () => {
  const token = createAccessToken({
    user: { id: "6de56141-9d93-4c0d-9f27-d36e0e9ff4c5", role: "owner" },
    business: { id: "93c3dbb8-feba-40c9-a40b-5b05a05bf3c5" },
  });

  const response = await request
    .post("/api/dashboard/loyalty-points")
    .set("Authorization", `Bearer ${token}`)
    .send({ customerId: "not-a-uuid", points: 0 })
    .expect(400);

  assert.equal(response.body.code, "validation_error");
});

test("customer access tokens cannot create business offers", async () => {
  const token = createAccessToken({
    user: { id: "d20f2898-27c8-46d1-9ae4-f9204d79a457", role: "customer" },
    business: { id: "93c3dbb8-feba-40c9-a40b-5b05a05bf3c5" },
  });

  const response = await request
    .post("/api/dashboard/offers")
    .set("Authorization", `Bearer ${token}`)
    .send({})
    .expect(403);

  assert.equal(response.body.code, "forbidden");
});
