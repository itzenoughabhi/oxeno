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
