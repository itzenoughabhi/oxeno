import { pool } from "../db.js";

export async function findActiveAccountByEmail(email) {
  const result = await pool.query(
    `SELECT
      u.id AS user_id,
      u.full_name,
      u.email,
      u.password_hash,
      u.google_subject,
      u.role,
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

export async function createBusinessAccount(data, passwordHash) {
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

export async function updateLastLogin(userId) {
  await pool.query("UPDATE app_users SET last_login_at = NOW() WHERE id = $1", [userId]);
}

export async function linkGoogleAccount(googleSubject, userId) {
  await pool.query(
    "UPDATE app_users SET google_subject = $1, last_login_at = NOW() WHERE id = $2",
    [googleSubject, userId],
  );
}
