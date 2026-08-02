import { pool } from "../db.js";

export async function getHealth(request, response) {
  await pool.query("SELECT 1");
  response.status(200).json({ status: "ok" });
}
