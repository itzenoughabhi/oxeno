import "dotenv/config";

import { createServer } from "node:http";
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { OAuth2Client } from "google-auth-library";
import { closeDatabase, pool } from "./db.js";

const scrypt = promisify(scryptCallback);
const envName = process.env.NODE_ENV?.trim() || "development";
const isProduction = envName === "production";
process.env.NODE_ENV = envName;

const port = Number(process.env.PORT || 3001);
const corsOriginEnv = process.env.CORS_ORIGIN;
const allowedOrigins = (corsOriginEnv || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (isProduction && !corsOriginEnv) {
  throw new Error("CORS_ORIGIN must be set in production to prevent open CORS policies.");
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const validPlans = new Set(["starter", "growth", "pro"]);
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = googleClientId ? new OAuth2Client(googleClientId) : null;

class RequestError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;

  if (origin && allowedOrigins.includes(origin)) {
    response.setHeader("Access-Control-Allow-Origin", origin);
    response.setHeader("Vary", "Origin");
  }

  response.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function sendJson(request, response, status, payload) {
  setCorsHeaders(request, response);
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(payload));
}

async function readJson(request) {
  let body = "";
  let bytesRead = 0;

  for await (const chunk of request) {
    bytesRead += chunk.length;
    if (bytesRead > 100_000) {
      throw new RequestError(413, "Request body is too large.");
    }
    body += chunk;
  }

  if (!body) {
    throw new RequestError(400, "Request body is required.");
  }

  try {
    return JSON.parse(body);
  } catch {
    throw new RequestError(400, "Request body must be valid JSON.");
  }
}

function requiredText(value, field, maxLength = 255) {
  if (typeof value !== "string" || !value.trim()) {
    throw new RequestError(400, `${field} is required.`);
  }

  const normalized = value.trim();
  if (normalized.length > maxLength) {
    throw new RequestError(400, `${field} is too long.`);
  }

  return normalized;
}

function validateSignup(payload) {
  const businessEmail = requiredText(payload.businessEmail, "Business email").toLowerCase();
  const password = requiredText(payload.password, "Password", 1024);

  if (!emailPattern.test(businessEmail)) {
    throw new RequestError(400, "Enter a valid business email address.");
  }
  if (password.length < 8) {
    throw new RequestError(400, "Password must be at least 8 characters.");
  }
  if (payload.confirmPassword !== password) {
    throw new RequestError(400, "Passwords do not match.");
  }
  if (!validPlans.has(payload.plan)) {
    throw new RequestError(400, "Select a valid subscription plan.");
  }
  if (payload.agreeTerms !== true || payload.agreePrivacy !== true) {
    throw new RequestError(400, "You must accept the Terms and Privacy Policy.");
  }

  return {
    businessName: requiredText(payload.businessName, "Business name"),
    ownerName: requiredText(payload.ownerName, "Owner name"),
    businessEmail,
    mobile: requiredText(payload.mobile, "Mobile number", 50),
    password,
    businessType: requiredText(payload.businessType, "Business type", 100),
    country: requiredText(payload.country, "Country", 100),
    state: requiredText(payload.state, "State", 100),
    city: requiredText(payload.city, "City", 100),
    zip: requiredText(payload.zip, "ZIP / PIN code", 30),
    address: requiredText(payload.address, "Business address", 500),
    plan: payload.plan,
  };
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const derivedKey = await scrypt(password, salt, 64);
  return `scrypt$${salt}$${Buffer.from(derivedKey).toString("base64url")}`;
}

async function verifyPassword(password, passwordHash) {
  const [algorithm, salt, encodedHash] = passwordHash.split("$");
  if (algorithm !== "scrypt" || !salt || !encodedHash) {
    return false;
  }

  const expectedHash = Buffer.from(encodedHash, "base64url");
  const actualHash = Buffer.from(await scrypt(password, salt, expectedHash.length));
  return actualHash.length === expectedHash.length && timingSafeEqual(actualHash, expectedHash);
}

async function findActiveAccountByEmail(email) {
  const result = await pool.query(
    `SELECT
      u.id AS user_id,
      u.full_name,
      u.email,
      u.password_hash,
      u.google_subject,
      b.id AS business_id,
      b.name AS business_name,
      s.plan_id
    FROM app_users u
    JOIN businesses b ON b.id = u.business_id
    JOIN subscriptions s
      ON s.business_id = b.id
      AND s.status IN ('trialing', 'active')
    WHERE u.email = $1
      AND u.is_active = TRUE
      AND b.is_active = TRUE
    ORDER BY s.created_at DESC
    LIMIT 1`,
    [email],
  );

  return result.rows[0];
}

function accountResponse(user) {
  return {
    user: { id: user.user_id, name: user.full_name, email: user.email },
    business: { id: user.business_id, name: user.business_name, plan: user.plan_id },
  };
}

async function authenticateUser(payload) {
  const email = requiredText(payload.email, "Email").toLowerCase();
  const password = requiredText(payload.password, "Password", 1024);

  if (!emailPattern.test(email)) {
    throw new RequestError(400, "Enter a valid email address.");
  }

  const user = await findActiveAccountByEmail(email);
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    throw new RequestError(401, "Invalid email or password.");
  }

  await pool.query("UPDATE app_users SET last_login_at = NOW() WHERE id = $1", [user.user_id]);
  return accountResponse(user);
}

async function authenticateGoogleUser(payload) {
  if (!googleClient || !googleClientId) {
    throw new RequestError(503, "Google sign-in is not configured.");
  }

  const credential = requiredText(payload.credential, "Google credential", 10_000);
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

  await pool.query(
    "UPDATE app_users SET google_subject = $1, last_login_at = NOW() WHERE id = $2",
    [googleSubject, user.user_id],
  );

  return accountResponse(user);
}

async function createBusinessAccount(payload) {
  const data = validateSignup(payload);
  const passwordHash = await hashPassword(data.password);
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const businessResult = await client.query(
      `INSERT INTO businesses (
        name, business_type, email, mobile, address_line, city, state, country, postal_code
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name`,
      [
        data.businessName,
        data.businessType,
        data.businessEmail,
        data.mobile,
        data.address,
        data.city,
        data.state,
        data.country,
        data.zip,
      ],
    );

    const business = businessResult.rows[0];
    const userResult = await client.query(
      `INSERT INTO app_users (
        business_id, full_name, email, mobile, password_hash, role,
        terms_accepted_at, privacy_accepted_at
      ) VALUES ($1, $2, $3, $4, $5, 'owner', NOW(), NOW())
      RETURNING id`,
      [business.id, data.ownerName, data.businessEmail, data.mobile, passwordHash],
    );

    await client.query(
      `INSERT INTO subscriptions (business_id, plan_id, status)
       VALUES ($1, $2, 'active')`,
      [business.id, data.plan],
    );

    await client.query("COMMIT");
    return { businessId: business.id, userId: userResult.rows[0].id };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

const server = createServer(async (request, response) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "OPTIONS") {
    setCorsHeaders(request, response);
    response.writeHead(204);
    response.end();
    return;
  }

  try {
    if (request.method === "GET" && pathname === "/api/health") {
      await pool.query("SELECT 1");
      sendJson(request, response, 200, { status: "ok" });
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/signup") {
      const account = await createBusinessAccount(await readJson(request));
      sendJson(request, response, 201, { message: "Account created successfully.", account });
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/login") {
      const account = await authenticateUser(await readJson(request));
      sendJson(request, response, 200, { message: "Login successful.", account });
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/google") {
      const account = await authenticateGoogleUser(await readJson(request));
      sendJson(request, response, 200, { message: "Google login successful.", account });
      return;
    }

    sendJson(request, response, 404, { error: "Route not found." });
  } catch (error) {
    if (error instanceof RequestError) {
      sendJson(request, response, error.status, { error: error.message, code: error.code });
      return;
    }
    if (error?.code === "23505") {
      sendJson(request, response, 409, { error: "An account with this business email already exists." });
      return;
    }

    console.error("API request failed:", error);
    const safeMessage = isProduction
      ? "Unable to complete the request. Please try again."
      : error.message || "Unable to complete the request. Please try again.";
    sendJson(request, response, 500, { error: safeMessage });
  }
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the process using port ${port} or set the PORT environment variable to a different port.`);
    process.exit(1);
  }
  console.error("Server error:", error);
  process.exit(1);
});

server.listen(port, () => {
  console.log(`Oxeno API running at http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await closeDatabase();
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
