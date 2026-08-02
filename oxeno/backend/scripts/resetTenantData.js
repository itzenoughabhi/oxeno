import { closeDatabase, pool } from "../server/db.js";

const tenantTables = [
  "app_users",
  "businesses",
  "campaign_recipients",
  "campaigns",
  "customers",
  "loyalty_memberships",
  "loyalty_point_events",
  "loyalty_programs",
  "offers",
  "qr_codes",
  "qr_scans",
  "review_requests",
  "usage_events",
  "verification_codes",
];

async function getResetSummary() {
  const result = await pool.query(
    `WITH requested_tables(name) AS (
      SELECT unnest($1::text[])
    )
    SELECT
      current_database() AS database_name,
      requested_tables.name AS table_name,
      COALESCE(stats.n_live_tup, 0)::bigint AS estimated_rows
    FROM requested_tables
    LEFT JOIN pg_stat_user_tables stats ON stats.relname = requested_tables.name
    ORDER BY requested_tables.name`,
    [tenantTables],
  );

  return result.rows;
}

async function getExactCounts() {
  const existingTablesResult = await pool.query(
    `SELECT relname
    FROM pg_class
    WHERE relkind = 'r' AND relname = ANY($1::text[])`,
    [tenantTables],
  );
  const existingTables = new Set(existingTablesResult.rows.map((row) => row.relname));

  return Promise.all(
    tenantTables.map(async (tableName) => {
      if (!existingTables.has(tableName)) {
        return { table_name: tableName, exact_rows: "not created" };
      }

      // tableName is selected from the fixed tenantTables list above, not request input.
      const result = await pool.query(`SELECT COUNT(*)::bigint AS exact_rows FROM "${tableName}"`);
      return { table_name: tableName, exact_rows: result.rows[0].exact_rows };
    }),
  );
}

async function main() {
  const summary = await getResetSummary();
  const databaseName = summary[0]?.database_name || "unknown";

  console.table(summary.map(({ table_name, estimated_rows }) => ({ table_name, estimated_rows })));

  if (process.argv.includes("--verify")) {
    console.table(await getExactCounts());
    console.log(`Verification completed for '${databaseName}'.`);
    return;
  }

  const confirmed = process.env.CONFIRM_TENANT_RESET === "true" || process.argv.includes("--confirm");

  if (!confirmed) {
    console.log(
      `Dry run only. No rows were deleted from '${databaseName}'. Run with --confirm to reset tenant data.`,
    );
    return;
  }

  await pool.query("BEGIN");
  try {
    // Businesses are the root tenant record. CASCADE also clears their users,
    // customers, loyalty data, offers, campaigns, scans, reviews, and usage events.
    // Plans are deliberately preserved because they are reusable application catalog data.
    await pool.query("TRUNCATE TABLE verification_codes, businesses CASCADE");
    await pool.query("COMMIT");
  } catch (error) {
    await pool.query("ROLLBACK");
    throw error;
  }

  console.log(`Tenant data in '${databaseName}' was reset successfully.`);
}

try {
  await main();
} finally {
  await closeDatabase();
}
