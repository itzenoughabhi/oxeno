import { pool } from "../db.js";

const fallbackDashboard = {
  stats: [
    { icon: "customers", label: "Total Customers", value: "0" },
    { icon: "registrations", label: "New Registrations", value: "0", sub: "Today" },
    { icon: "scans", label: "QR Code Scans", value: "0", sub: "Today" },
    { icon: "calls", label: "AI Voice Calls", value: "0", sub: "Today" },
    { icon: "messages", label: "WhatsApp Messages", value: "0", sub: "Today" },
    { icon: "reviews", label: "Pending Review Requests", value: "0" },
  ],
  upcomingBirthdays: [],
  upcomingAnniversaries: [],
  activeCampaigns: [],
  subscription: { plan: "Growth", status: "Active", renews: "Soon" },
  usage: [
    { label: "WhatsApp Usage", used: 0, limit: 5000, unit: "messages" },
    { label: "AI Voice Usage", used: 0, limit: 200, unit: "minutes" },
  ],
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function normalizeStats(rows) {
  return [
    { icon: "customers", label: "Total Customers", value: formatNumber(rows.totalCustomers) },
    {
      icon: "registrations",
      label: "New Registrations",
      value: formatNumber(rows.newRegistrations),
      sub: "Today",
    },
    {
      icon: "scans",
      label: "QR Code Scans",
      value: formatNumber(rows.qrScans),
      sub: "Today",
    },
    {
      icon: "calls",
      label: "AI Voice Calls",
      value: formatNumber(rows.aiVoiceCalls),
      sub: "Today",
    },
    {
      icon: "messages",
      label: "WhatsApp Messages",
      value: formatNumber(rows.whatsappMessages),
      sub: "Today",
    },
    {
      icon: "reviews",
      label: "Pending Review Requests",
      value: formatNumber(rows.pendingReviews),
    },
  ];
}

function normalizeUseBar(limit, used, label) {
  const safeLimit = Number(limit || 0);
  const safeUsed = Number(used || 0);
  return {
    label,
    used: safeUsed,
    limit: safeLimit || 1,
    unit: label === "WhatsApp Usage" ? "messages" : "minutes",
  };
}

export async function getDashboardData(businessId) {
  if (!businessId) {
    return fallbackDashboard;
  }

  try {
    const [
      customerStats,
      recentStats,
      pendingReviews,
      birthdays,
      anniversaries,
      campaigns,
      subscriptionResult,
      usageLimits,
    ] = await Promise.all([
      pool.query(
        `SELECT
            COUNT(*)::int AS total_customers,
            COUNT(*) FILTER (WHERE joined_at >= CURRENT_DATE)::int AS new_registrations
          FROM customers
          WHERE business_id = $1 AND is_active = TRUE`,
        [businessId],
      ),
      pool.query(
        `SELECT
            COUNT(*) FILTER (WHERE qr_code_id IS NOT NULL AND scanned_at >= CURRENT_DATE)::int AS qr_scans,
            COUNT(*) FILTER (WHERE event_type = 'ai_voice_minute' AND occurred_at >= CURRENT_DATE)::int AS ai_voice_calls,
            COUNT(*) FILTER (WHERE event_type = 'whatsapp_message' AND occurred_at >= CURRENT_DATE)::int AS whatsapp_messages
          FROM (
            SELECT qs.qr_code_id, qs.scanned_at, NULL::text AS event_type, NULL::timestamptz AS occurred_at
            FROM qr_scans qs
            JOIN qr_codes qc ON qc.id = qs.qr_code_id
            JOIN loyalty_programs lp ON lp.id = qc.loyalty_program_id
            WHERE lp.business_id = $1
            UNION ALL
            SELECT NULL::uuid, NULL::timestamptz, ue.event_type, ue.occurred_at
            FROM usage_events ue
            WHERE ue.business_id = $1
          ) AS combined`,
        [businessId],
      ),
      pool.query(
        `SELECT COUNT(*)::int AS pending_reviews
          FROM review_requests
          WHERE business_id = $1 AND status = 'pending'`,
        [businessId],
      ),
      pool.query(
        `SELECT full_name AS name, birth_date::text AS date
          FROM customers
          WHERE business_id = $1 AND birth_date IS NOT NULL
            AND EXTRACT(MONTH FROM birth_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM birth_date) BETWEEN EXTRACT(DAY FROM CURRENT_DATE) AND EXTRACT(DAY FROM CURRENT_DATE) + 14
          ORDER BY birth_date ASC
          LIMIT 4`,
        [businessId],
      ),
      pool.query(
        `SELECT full_name AS name, anniversary_date::text AS date
          FROM customers
          WHERE business_id = $1 AND anniversary_date IS NOT NULL
            AND EXTRACT(MONTH FROM anniversary_date) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(DAY FROM anniversary_date) BETWEEN EXTRACT(DAY FROM CURRENT_DATE) AND EXTRACT(DAY FROM CURRENT_DATE) + 14
          ORDER BY anniversary_date ASC
          LIMIT 4`,
        [businessId],
      ),
      pool.query(
        `SELECT name, status, message_body
          FROM campaigns
          WHERE business_id = $1 AND status IN ('scheduled', 'live')
          ORDER BY created_at DESC
          LIMIT 3`,
        [businessId],
      ),
      pool.query(
        `SELECT s.status, s.renews_at, p.name AS plan_name, p.whatsapp_message_limit, p.ai_voice_minutes_limit
          FROM subscriptions s
          JOIN plans p ON p.id = s.plan_id
          WHERE s.business_id = $1
          ORDER BY s.created_at DESC
          LIMIT 1`,
        [businessId],
      ),
      pool.query(
        `SELECT
            COALESCE(SUM(CASE WHEN event_type = 'whatsapp_message' THEN units ELSE 0 END), 0)::int AS whatsapp_used,
            COALESCE(SUM(CASE WHEN event_type = 'ai_voice_minute' THEN units ELSE 0 END), 0)::int AS ai_voice_used
          FROM usage_events
          WHERE business_id = $1
            AND occurred_at >= DATE_TRUNC('month', CURRENT_DATE)`,
        [businessId],
      ),
    ]);

    const customerRow = customerStats.rows[0] || {};
    const recentRow = recentStats.rows[0] || {};
    const reviewRow = pendingReviews.rows[0] || {};
    const subscriptionRow = subscriptionResult.rows[0] || null;
    const usageRow = usageLimits.rows[0] || {};

    const stats = normalizeStats({
      totalCustomers: customerRow.total_customers || 0,
      newRegistrations: customerRow.new_registrations || 0,
      qrScans: recentRow.qr_scans || 0,
      aiVoiceCalls: recentRow.ai_voice_calls || 0,
      whatsappMessages: recentRow.whatsapp_messages || 0,
      pendingReviews: reviewRow.pending_reviews || 0,
    });

    const upcomingBirthdays = (birthdays.rows || []).map((row) => ({
      name: row.name,
      date: row.date
        ? new Date(`${row.date}T00:00:00`).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Soon",
    }));

    const upcomingAnniversaries = (anniversaries.rows || []).map((row) => ({
      name: row.name,
      date: row.date
        ? new Date(`${row.date}T00:00:00`).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
          })
        : "Soon",
      detail: "Member since",
    }));

    const activeCampaigns = (campaigns.rows || []).map((row) => ({
      name: row.name,
      status: row.status === "live" ? "Live" : "Scheduled",
      metric: row.message_body ? "Ready to send" : "—",
    }));

    const subscription = {
      plan: subscriptionRow?.plan_name || "Growth",
      status: subscriptionRow?.status
        ? subscriptionRow.status.charAt(0).toUpperCase() + subscriptionRow.status.slice(1)
        : "Active",
      renews: subscriptionRow?.renews_at
        ? new Date(subscriptionRow.renews_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Soon",
    };

    const usage = [
      normalizeUseBar(
        subscriptionRow?.whatsapp_message_limit,
        usageRow.whatsapp_used,
        "WhatsApp Usage",
      ),
      normalizeUseBar(
        subscriptionRow?.ai_voice_minutes_limit,
        usageRow.ai_voice_used,
        "AI Voice Usage",
      ),
    ];

    return {
      stats,
      upcomingBirthdays,
      upcomingAnniversaries,
      activeCampaigns,
      subscription,
      usage,
    };
  } catch {
    return fallbackDashboard;
  }
}
