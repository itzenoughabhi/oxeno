import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../server/db.js';

const email = process.argv[2];
if (!email) {
  console.error('Usage: node backup_and_delete_user.js user@example.com');
  process.exit(2);
}

const now = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.resolve(process.cwd(), 'backups', `${email.replace(/[@.]/g, '_')}_${now}`);
fs.mkdirSync(outDir, { recursive: true });

function write(name, rows) {
  fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(rows, null, 2));
}

(async () => {
  try {
    console.log('Looking up business for', email);
    const bRes = await pool.query('SELECT * FROM businesses WHERE email = $1', [email]);
    if (!bRes.rows.length) {
      console.log('No business found for', email);
      process.exit(0);
    }

    const business = bRes.rows[0];
    write('business', [business]);
    const businessId = business.id;

    // Core tables referencing business_id
    const coreTables = ['app_users','subscriptions','customers','loyalty_programs','campaigns','review_requests','usage_events'];
    for (const t of coreTables) {
      const r = await pool.query(`SELECT * FROM ${t} WHERE business_id = $1`, [businessId]);
      write(t, r.rows);
    }

    // loyalty -> qr_codes -> qr_scans
    const lp = await pool.query('SELECT id FROM loyalty_programs WHERE business_id = $1', [businessId]);
    const loyaltyIds = lp.rows.map(r => r.id);
    write('loyalty_programs_ids', loyaltyIds);

    if (loyaltyIds.length) {
      const qrc = await pool.query('SELECT * FROM qr_codes WHERE loyalty_program_id = ANY($1)', [loyaltyIds]);
      write('qr_codes', qrc.rows);
      const qrIds = qrc.rows.map(r => r.id);
      if (qrIds.length) {
        const scans = await pool.query('SELECT * FROM qr_scans WHERE qr_code_id = ANY($1)', [qrIds]);
        write('qr_scans', scans.rows);
      }
    }

    // campaigns -> campaign_recipients
    const camp = await pool.query('SELECT id FROM campaigns WHERE business_id = $1', [businessId]);
    const campIds = camp.rows.map(r => r.id);
    write('campaigns_ids', campIds);
    if (campIds.length) {
      const recipients = await pool.query('SELECT * FROM campaign_recipients WHERE campaign_id = ANY($1)', [campIds]);
      write('campaign_recipients', recipients.rows);
    }

    // verification codes matching email
    const vc = await pool.query('SELECT * FROM verification_codes WHERE email = $1', [email]);
    write('verification_codes', vc.rows);

    console.log('Backup written to', outDir);

    // Perform deletion in a transaction
    console.log('Deleting business and cascading data...');
    await pool.query('BEGIN');
    await pool.query('DELETE FROM businesses WHERE id = $1', [businessId]);
    await pool.query('COMMIT');

    console.log('Deletion completed.');
  } catch (e) {
    console.error('ERROR', e.message);
    try { await pool.query('ROLLBACK'); } catch {};
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
