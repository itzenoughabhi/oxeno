import { OAuth2Client } from "google-auth-library";
import { RequestError } from "../errors/RequestError.js";
import {
  createBusinessAccount,
  findActiveAccountByEmail,
  linkGoogleAccount,
  updateLastLogin,
} from "../repositories/authRepository.js";
import { createAccessToken } from "./tokenService.js";
import { hashPassword, verifyPassword } from "./passwordService.js";

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function accountResponse(user) {
  return {
    user: {
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      role: user.role,
    },
    business: { id: user.business_id, name: user.business_name, plan: user.plan_id },
  };
}

function sessionResponse(user) {
  const account = accountResponse(user);

  return {
    accessToken: createAccessToken(account),
    account,
    tokenType: "Bearer",
  };
}

export async function createAccount(data) {
  const passwordHash = await hashPassword(data.password);
  return createBusinessAccount(data, passwordHash);
}

export async function authenticatePasswordAccount(data) {
  const user = await findActiveAccountByEmail(data.email);
  if (!user || !(await verifyPassword(data.password, user.password_hash))) {
    throw new RequestError(401, "Invalid email or password.");
  }

  await updateLastLogin(user.user_id);
  return sessionResponse(user);
}

export async function authenticateGoogleAccount({ credential }) {
  if (!googleClient || !googleClientId) {
    throw new RequestError(503, "Google sign-in is not configured.");
  }

  let googleProfile;

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: googleClientId,
    });
    googleProfile = ticket.getPayload();
  } catch {
    throw new RequestError(401, "Google sign-in could not be verified.");
  }

  const email = googleProfile?.email?.toLowerCase();
  const googleSubject = googleProfile?.sub;
  if (!email || !emailPattern.test(email) || !googleProfile.email_verified || !googleSubject) {
    throw new RequestError(401, "Google did not provide a verified email address.");
  }

  const user = await findActiveAccountByEmail(email);
  if (!user) {
    throw new RequestError(
      404,
      "No Oxeno account exists for this Google email. Please create an account first.",
      "account_not_found",
    );
  }
  if (user.google_subject && user.google_subject !== googleSubject) {
    throw new RequestError(401, "This Google account is not linked to the Oxeno account.");
  }

  await linkGoogleAccount(googleSubject, user.user_id);
  return sessionResponse(user);
}
