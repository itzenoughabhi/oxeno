import { pool } from "../db.js";

export async function listBusinessCategories() {
  const result = await pool.query(
    `SELECT DISTINCT business_type AS category
    FROM businesses
    WHERE is_active = TRUE
    ORDER BY business_type ASC`,
  );

  return result.rows;
}

export async function listActiveBusinesses(category) {
  const result = await pool.query(
    `SELECT id, name, business_type, city
    FROM businesses
    WHERE is_active = TRUE
      AND business_type = $1
    ORDER BY name ASC`,
    [category],
  );

  return result.rows;
}

export async function findActiveBusinessById(businessId) {
  const result = await pool.query(
    `SELECT id, name, business_type, city
    FROM businesses
    WHERE id = $1 AND is_active = TRUE
    LIMIT 1`,
    [businessId],
  );

  return result.rows[0];
}

export async function findCustomerByWhatsAppNumber(whatsappNumber) {
  const result = await pool.query(
    `SELECT
      c.id AS customer_id,
      c.full_name,
      c.email,
      c.mobile,
      c.birth_date,
      c.anniversary_date,
      c.gender,
      c.city AS customer_city,
      c.is_married,
      c.business_id,
      b.name AS business_name,
      b.business_type,
      b.city AS business_city
    FROM customers c
    JOIN businesses b ON b.id = c.business_id
    WHERE c.mobile = $1
      AND c.is_active = TRUE
      AND b.is_active = TRUE
    LIMIT 1`,
    [whatsappNumber],
  );

  return result.rows[0];
}

export async function findCustomerByEmail(email) {
  const result = await pool.query(
    `SELECT
      c.id AS customer_id,
      c.full_name,
      c.email,
      c.mobile,
      c.birth_date,
      c.anniversary_date,
      c.gender,
      c.city AS customer_city,
      c.is_married,
      c.password_hash,
      c.business_id,
      b.name AS business_name,
      b.business_type,
      b.city AS business_city
    FROM customers c
    JOIN businesses b ON b.id = c.business_id
    WHERE c.email = $1
      AND c.is_active = TRUE
      AND b.is_active = TRUE
    LIMIT 1`,
    [email],
  );

  return result.rows[0];
}

export async function findCustomerByIdAndBusiness(customerId, businessId) {
  const result = await pool.query(
    `SELECT
      c.id AS customer_id,
      c.full_name,
      c.email,
      c.mobile,
      c.birth_date,
      c.anniversary_date,
      c.gender,
      c.city AS customer_city,
      c.is_married,
      c.business_id,
      b.name AS business_name,
      b.business_type,
      b.city AS business_city
    FROM customers c
    JOIN businesses b ON b.id = c.business_id
    WHERE c.id = $1
      AND c.business_id = $2
      AND c.is_active = TRUE
      AND b.is_active = TRUE
    LIMIT 1`,
    [customerId, businessId],
  );

  return result.rows[0];
}

export async function createCustomer(data, passwordHash) {
  const result = await pool.query(
    `INSERT INTO customers (
      business_id, full_name, email, mobile, birth_date,
      anniversary_date, gender, city, is_married, password_hash
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING
      id AS customer_id,
      full_name,
      email,
      mobile,
      birth_date,
      anniversary_date,
      gender,
      city AS customer_city,
      is_married,
      business_id`,
    [
      data.businessId,
      data.fullName,
      data.email,
      data.whatsappNumber,
      data.birthDate,
      data.anniversaryDate,
      data.gender,
      data.city,
      data.isMarried,
      passwordHash,
    ],
  );

  return result.rows[0];
}

export async function findCustomerLoyaltyPrograms(customerId, businessId) {
  const result = await pool.query(
    `SELECT lp.name, lm.points_balance
    FROM loyalty_memberships lm
    JOIN loyalty_programs lp ON lp.id = lm.loyalty_program_id
    WHERE lm.customer_id = $1
      AND lp.business_id = $2
      AND lp.is_active = TRUE
    ORDER BY lp.name ASC`,
    [customerId, businessId],
  );

  return result.rows;
}

export async function findActiveOffersForBusiness(businessId) {
  const result = await pool.query(
    `SELECT id, title, description, discount_label, coupon_code, expires_at
    FROM offers
    WHERE business_id = $1
      AND is_active = TRUE
      AND expires_at > NOW()
    ORDER BY expires_at ASC
    LIMIT 6`,
    [businessId],
  );

  return result.rows;
}

export async function findCustomerLoyaltyHistory(customerId, businessId) {
  const result = await pool.query(
    `SELECT lpe.points, lpe.note, lpe.created_at, lp.name AS program_name
    FROM loyalty_point_events lpe
    JOIN loyalty_programs lp ON lp.id = lpe.loyalty_program_id
    WHERE lpe.customer_id = $1 AND lpe.business_id = $2
    ORDER BY lpe.created_at DESC
    LIMIT 5`,
    [customerId, businessId],
  );

  return result.rows;
}

export async function findCustomerVisitHistory(customerId, businessId) {
  const result = await pool.query(
    `SELECT qs.scanned_at, lp.name AS program_name
    FROM qr_scans qs
    JOIN qr_codes qc ON qc.id = qs.qr_code_id
    JOIN loyalty_programs lp ON lp.id = qc.loyalty_program_id
    WHERE qs.customer_id = $1 AND lp.business_id = $2
    ORDER BY qs.scanned_at DESC
    LIMIT 6`,
    [customerId, businessId],
  );

  return result.rows;
}
