import assert from "node:assert/strict";
import test from "node:test";
import { loginSchema, signupSchema } from "../server/validators/authSchemas.js";

const validSignup = {
  businessName: "Oxeno Cafe",
  ownerName: "Asha Patel",
  businessEmail: "ASHA@EXAMPLE.COM",
  mobile: "+91 99999 99999",
  password: "secure-password",
  confirmPassword: "secure-password",
  businessType: "Cafe",
  country: "India",
  state: "Karnataka",
  city: "Bengaluru",
  zip: "560001",
  address: "1 Main Street",
  plan: "growth",
  agreeTerms: true,
  agreePrivacy: true,
};

test("signup schema normalizes the business email", () => {
  const result = signupSchema.safeParse(validSignup);

  assert.equal(result.success, true);
  assert.equal(result.data.businessEmail, "asha@example.com");
});

test("signup schema rejects mismatched passwords", () => {
  const result = signupSchema.safeParse({ ...validSignup, confirmPassword: "different-password" });

  assert.equal(result.success, false);
  assert.equal(result.error.issues[0].message, "Passwords do not match.");
});

test("login schema rejects an invalid email", () => {
  const result = loginSchema.safeParse({ email: "not-an-email", password: "password" });

  assert.equal(result.success, false);
  assert.equal(result.error.issues[0].message, "Enter a valid email address.");
});
