import { Pool } from "pg";

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
    throw new Error(
      `Missing required PostgreSQL environment variables: ${missingVars.join(", ")}`,
    );
  }

  if (process.env.POSTGRES_PASSWORD.includes("REPLACE_WITH_YOUR")) {
    throw new Error("Invalid PostgreSQL password configured in environment variables.");
  }

  return `postgresql://${encodeURIComponent(process.env.POSTGRES_USER)}:${encodeURIComponent(
    process.env.POSTGRES_PASSWORD,
  )}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/${process.env.POSTGRES_DB}`;
}

export const pool = new Pool({
  connectionString: getConnectionString(),
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

export async function closeDatabase() {
  await pool.end();
}
