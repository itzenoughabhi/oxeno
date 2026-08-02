import assert from "node:assert/strict";
import test from "node:test";

process.env.JWT_SECRET = "test-secret-that-is-long-enough-to-sign-access-tokens";
process.env.JWT_EXPIRES_IN = "15m";

const { createAccessToken, verifyAccessToken } = await import("../server/services/tokenService.js");

const account = {
  user: { id: "6de56141-9d93-4c0d-9f27-d36e0e9ff4c5", role: "owner" },
  business: { id: "93c3dbb8-feba-40c9-a40b-5b05a05bf3c5" },
};

test("access tokens contain the authenticated account claims", () => {
  const token = createAccessToken(account);
  const claims = verifyAccessToken(token);

  assert.equal(claims.sub, account.user.id);
  assert.equal(claims.businessId, account.business.id);
  assert.equal(claims.role, "owner");
});

test("invalid access tokens are rejected", () => {
  assert.throws(() => verifyAccessToken("not-a-valid-token"), {
    code: "invalid_token",
    status: 401,
  });
});
