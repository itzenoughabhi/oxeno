// src/pages/Dashboard.jsx
import {
  Users, UserPlus, QrCode, Phone, MessageCircle, Star,
  Cake, Heart, Megaphone, CreditCard,
} from "lucide-react";
import BusinessProfileMenu, { OWNER } from "../components/Navbar/BusinessProfileMenu.jsx";
import "./Dashboard.css";

// TODO: replace all placeholder data below with real API data once the
// backend/dashboard endpoints exist.

const QUICK_STATS = [
  { icon: Users, label: "Total Customers", value: "2,148" },
  { icon: UserPlus, label: "New Registrations", value: "34", sub: "Today" },
  { icon: QrCode, label: "QR Code Scans", value: "512", sub: "Today" },
  { icon: Phone, label: "AI Voice Calls", value: "27", sub: "Today" },
  { icon: MessageCircle, label: "WhatsApp Messages", value: "1,290", sub: "Today" },
  { icon: Star, label: "Pending Review Requests", value: "9" },
];

const UPCOMING_BIRTHDAYS = [
  { name: "Priya Nair", date: "Aug 4" },
  { name: "Rohit Verma", date: "Aug 6" },
  { name: "Sana Iyer", date: "Aug 9" },
  { name: "Karan Shah", date: "Aug 12" },
];

const UPCOMING_ANNIVERSARIES = [
  { name: "Neha Kapoor", date: "Aug 5", detail: "2 years with you" },
  { name: "Arjun Mehta", date: "Aug 10", detail: "1 year with you" },
  { name: "Divya Rao", date: "Aug 15", detail: "3 years with you" },
];

const ACTIVE_CAMPAIGNS = [
  { name: "Weekend Loyalty Boost", status: "Live", metric: "92% opened" },
  { name: "Win-back: 30-day inactive", status: "Live", metric: "44% redeemed" },
  { name: "New store launch offer", status: "Scheduled", metric: "—" },
];

const SUBSCRIPTION = {
  plan: "Growth",
  status: "Active",
  renews: "Sep 12, 2026",
};

const USAGE = [
  { label: "WhatsApp Usage", used: 1290, limit: 5000, unit: "messages" },
  { label: "AI Voice Usage", used: 27, limit: 200, unit: "minutes" },
];

export default function Dashboard({ onNavigate }) {
  const firstName = OWNER.name.split(" ")[0];

  return (
    <div className="dashboard">
      <header className="dashboard__topbar">
        <a
          href="/"
          className="dashboard__logo"
          onClick={(e) => {
            e.preventDefault();
            onNavigate?.("home");
          }}
        >
          <span className="dashboard__logo-dot" />
          <span className="dashboard__logo-text">OXENO</span>
        </a>
        <BusinessProfileMenu onNavigate={onNavigate} />
      </header>

      <main className="dashboard__body">
        <div className="dashboard__intro">
          <h1>Welcome back, {firstName}</h1>
          <p>Here's what's happening with {OWNER.business} today.</p>
        </div>

        {/* Total Customers · New Registrations · QR Code Scans ·
            AI Voice Calls · WhatsApp Messages · Pending Review Requests */}
        <div className="dashboard__stats">
          {QUICK_STATS.map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        <div className="dashboard__row">
          {/* Upcoming Birthdays */}
          <ListCard title="Upcoming Birthdays" icon={Cake}>
            {UPCOMING_BIRTHDAYS.map((b) => (
              <li key={b.name} className="dashboard__list-row">
                <span>{b.name}</span>
                <span className="dashboard__list-date">{b.date}</span>
              </li>
            ))}
          </ListCard>

          {/* Upcoming Anniversaries */}
          <ListCard title="Upcoming Anniversaries" icon={Heart}>
            {UPCOMING_ANNIVERSARIES.map((a) => (
              <li key={a.name} className="dashboard__list-row">
                <span>
                  {a.name}
                  <span className="dashboard__list-detail"> · {a.detail}</span>
                </span>
                <span className="dashboard__list-date">{a.date}</span>
              </li>
            ))}
          </ListCard>
        </div>

        <div className="dashboard__row dashboard__row--split">
          {/* Active Campaigns */}
          <div className="widget-card">
            <div className="widget-card__head">
              <Megaphone size={18} />
              <h2>Active Campaigns</h2>
            </div>
            <ul className="dashboard__campaigns">
              {ACTIVE_CAMPAIGNS.map((c) => (
                <li key={c.name} className="dashboard__campaign-row">
                  <div>
                    <div className="dashboard__campaign-name">{c.name}</div>
                    <div className="dashboard__campaign-metric">{c.metric}</div>
                  </div>
                  <span
                    className={`dashboard__badge ${
                      c.status === "Live" ? "dashboard__badge--live" : "dashboard__badge--scheduled"
                    }`}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="dashboard__side">
            {/* Subscription Status */}
            <div className="widget-card">
              <div className="widget-card__head">
                <CreditCard size={18} />
                <h2>Subscription Status</h2>
              </div>
              <div className="dashboard__sub">
                <div className="dashboard__sub-plan">{SUBSCRIPTION.plan} Plan</div>
                <span className="dashboard__badge dashboard__badge--live">
                  {SUBSCRIPTION.status}
                </span>
              </div>
              <p className="dashboard__sub-renew">Renews {SUBSCRIPTION.renews}</p>
            </div>

            {/* WhatsApp Usage · AI Voice Usage */}
            <div className="widget-card">
              <div className="widget-card__head">
                <h2>Usage This Month</h2>
              </div>
              <div className="dashboard__usage-list">
                {USAGE.map((u) => (
                  <UsageBar key={u.label} {...u} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="stat-card">
      <span className="stat-card__icon">
        <Icon size={18} />
      </span>
      <div>
        <div className="stat-card__value">{value}</div>
        <div className="stat-card__label">
          {label}
          {sub && <span className="stat-card__sub"> · {sub}</span>}
        </div>
      </div>
    </div>
  );
}

function ListCard({ title, icon: Icon, children }) {
  return (
    <div className="widget-card">
      <div className="widget-card__head">
        <Icon size={18} />
        <h2>{title}</h2>
      </div>
      <ul className="dashboard__list">{children}</ul>
    </div>
  );
}

function UsageBar({ label, used, limit, unit }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="usage-bar">
      <div className="usage-bar__labels">
        <span>{label}</span>
        <span>
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </span>
      </div>
      <div className="usage-bar__track">
        <div className="usage-bar__fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}