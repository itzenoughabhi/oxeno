import { Pool } from "pg";
import { isProduction } from "./config/environment.js";

function parseBoolean(value, defaultValue, name) {
  const normalizedValue = value?.trim().toLowerCase();

  if (normalizedValue === undefined || normalizedValue === "") {
    return defaultValue;
  }

  if (normalizedValue === "true") return true;
  if (normalizedValue === "false") return false;
  throw new Error(`${name} must be either true or false.`);
}

function getConnectionString() {
  const configuredUrl = process.env.DATABASE_URL?.trim();
  const validDatabaseUrl = /^postgres(?:ql)?:\/\//i.test(configuredUrl || "");

  // If a fully-formed DATABASE_URL is provided and does not contain a
  // placeholder value, prefer it. If the value contains the placeholder
  // token (e.g. REPLACE_WITH_YOUR), ignore it and fall back to the
  // individual POSTGRES_* environment variables so accidental placeholders
  // don't cause authentication failures.
  if (configuredUrl && validDatabaseUrl && !configuredUrl.includes("REPLACE_WITH_YOUR")) {
    return configuredUrl;
  }

  const requiredVars = [
    "POSTGRES_HOST",
    "POSTGRES_PORT",
    "POSTGRES_DB",
    "POSTGRES_USER",
    "POSTGRES_PASSWORD",
  ];

  const missingVars = requiredVars.filter((name) => !process.env[name]?.trim());
  if (missingVars.length) {
    throw new Error(`Missing required PostgreSQL environment variables: ${missingVars.join(", ")}`);
  }

  if (process.env.POSTGRES_PASSWORD.includes("REPLACE_WITH_YOUR")) {
    throw new Error("Invalid PostgreSQL password configured in environment variables.");
  }

  return `postgresql://${encodeURIComponent(process.env.POSTGRES_USER)}:${encodeURIComponent(
    process.env.POSTGRES_PASSWORD,
  )}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
}

const sslEnabled = parseBoolean(process.env.DATABASE_SSL, isProduction, "DATABASE_SSL");
const rejectUnauthorized = parseBoolean(
  process.env.DATABASE_SSL_REJECT_UNAUTHORIZED,
  true,
  "DATABASE_SSL_REJECT_UNAUTHORIZED",
);
const databaseSslCa = process.env.DATABASE_SSL_CA?.replace(/\\n/g, "\n");

const ssl = sslEnabled
  ? {
      rejectUnauthorized,
      ...(databaseSslCa ? { ca: databaseSslCa } : {}),
    }
  : false;

export const pool = new Pool({
  connectionString: getConnectionString(),
  ssl,
});

export async function closeDatabase() {
  await pool.end();
}
