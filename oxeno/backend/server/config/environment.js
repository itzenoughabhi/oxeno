import "dotenv/config";

export const envName = process.env.NODE_ENV?.trim() || "development";
export const isProduction = envName === "production";
export const port = Number(process.env.PORT || 3001);
export const jwtSecret = process.env.JWT_SECRET?.trim();
export const jwtExpiresIn = process.env.JWT_EXPIRES_IN?.trim() || "15m";
const trustProxyValue = process.env.TRUST_PROXY?.trim().toLowerCase();
export const trustProxy = trustProxyValue === "true";

process.env.NODE_ENV = envName;

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error("PORT must be a valid TCP port number.");
}

if (!jwtSecret) {
  throw new Error("JWT_SECRET must be set to sign access tokens.");
}

if (isProduction && jwtSecret.length < 32) {
  throw new Error("JWT_SECRET must be at least 32 characters in production.");
}

if (trustProxyValue && trustProxyValue !== "true" && trustProxyValue !== "false") {
  throw new Error("TRUST_PROXY must be either true or false.");
}
