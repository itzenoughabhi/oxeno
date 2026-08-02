import { pool } from "../db.js";

export async function listBusinessCustomers(businessId) {
  const result = await pool.query(
    `SELECT id, full_name, email, mobile
    FROM customers
    WHERE business_id = $1 AND is_active = TRUE
    ORDER BY full_name ASC`,
    [businessId],
  );

  return result.rows;
}

export async function listBusinessLoyaltyPrograms(businessId) {
  const result = await pool.query(
    `SELECT id, name, reward_threshold
    FROM loyalty_programs
    WHERE business_id = $1 AND is_active = TRUE
    ORDER BY created_at ASC`,
    [businessId],
  );

  return result.rows;
}

async function getOrCreateDefaultProgram(client, businessId) {
  const existing = await client.query(
    `SELECT id, name
    FROM loyalty_programs
    WHERE business_id = $1 AND is_active = TRUE
    ORDER BY created_at ASC
    LIMIT 1`,
    [businessId],
  );

  if (existing.rows[0]) return existing.rows[0];

  const created = await client.query(
    `INSERT INTO loyalty_programs (business_id, name, reward_threshold)
    VALUES ($1, 'Oxeno rewards', 100)
    RETURNING id, name`,
    [businessId],
  );

  return created.rows[0];
}

export async function awardPoints(businessId, data) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const customerResult = await client.query(
      `SELECT id, full_name
      FROM customers
      WHERE id = $1 AND business_id = $2 AND is_active = TRUE
      LIMIT 1`,
      [data.customerId, businessId],
    );
    const customer = customerResult.rows[0];
    if (!customer) {
      const error = new Error("customer_not_found");
      error.code = "customer_not_found";
      throw error;
    }

    let program;
    if (data.loyaltyProgramId) {
      const programResult = await client.query(
        `SELECT id, name
        FROM loyalty_programs
        WHERE id = $1 AND business_id = $2 AND is_active = TRUE
        LIMIT 1`,
        [data.loyaltyProgramId, businessId],
      );
      program = programResult.rows[0];
      if (!program) {
        const error = new Error("loyalty_program_not_found");
        error.code = "loyalty_program_not_found";
        throw error;
      }
    } else {
      program = await getOrCreateDefaultProgram(client, businessId);
    }

    const membershipResult = await client.query(
      `INSERT INTO loyalty_memberships (loyalty_program_id, customer_id, points_balance)
      VALUES ($1, $2, $3)
      ON CONFLICT (loyalty_program_id, customer_id)
      DO UPDATE SET
        points_balance = loyalty_memberships.points_balance + EXCLUDED.points_balance,
        updated_at = NOW()
      RETURNING points_balance`,
      [program.id, customer.id, data.points],
    );

    await client.query(
      `INSERT INTO loyalty_point_events (
        business_id, customer_id, loyalty_program_id, points, note
      ) VALUES ($1, $2, $3, $4, $5)`,
      [businessId, customer.id, program.id, data.points, data.note],
    );

    await client.query("COMMIT");
    return {
      customerName: customer.full_name,
      programName: program.name,
      pointsBalance: Number(membershipResult.rows[0].points_balance),
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function createBusinessOffer(businessId, data) {
  const result = await pool.query(
    `INSERT INTO offers (
      business_id, title, description, discount_label, coupon_code, expires_at
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING id, title, description, discount_label, coupon_code, expires_at, is_active, created_at`,
    [businessId, data.title, data.description, data.discountLabel, data.couponCode, data.expiresAt],
  );

  return result.rows[0];
}

export async function listBusinessOffers(businessId) {
  const result = await pool.query(
    `SELECT id, title, description, discount_label, coupon_code, expires_at, is_active, created_at
    FROM offers
    WHERE business_id = $1
    ORDER BY is_active DESC, expires_at ASC
    LIMIT 25`,
    [businessId],
  );

  return result.rows;
}
