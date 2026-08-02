import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Cake,
  CalendarHeart,
  ChartNoAxesCombined,
  ChevronDown,
  CircleHelp,
  CreditCard,
  Gift,
  LayoutDashboard,
  Megaphone,
  Menu,
  MessageCircle,
  Phone,
  QrCode,
  Settings,
  Sparkles,
  Star,
  Users,
  UserPlus,
  X,
} from "lucide-react";
import BusinessQuickActions from "../components/BusinessDashboard/BusinessQuickActions.jsx";
import BusinessProfileMenu from "../components/Navbar/BusinessProfileMenu.jsx";
import { getDashboardData } from "../services/api.js";
import "./Dashboard.css";

const FALLBACK_DASHBOARD = {
  stats: [
    { icon: "customers", label: "Total Customers", value: "0" },
    {
      icon: "registrations",
      label: "New Registrations",
      value: "0",
      sub: "Today",
    },
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

const STAT_ICON_MAP = {
  customers: Users,
  registrations: UserPlus,
  scans: QrCode,
  calls: Phone,
  messages: MessageCircle,
  reviews: Star,
};

const navigationItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "customers", label: "Customers", icon: Users },
  { id: "rewards-studio", label: "Rewards studio", icon: Gift },
  { id: "campaigns", label: "Campaigns", icon: Megaphone },
  { id: "qr-loyalty", label: "QR loyalty", icon: QrCode },
  { id: "analytics", label: "Analytics", icon: ChartNoAxesCombined },
  { id: "settings", label: "Settings", icon: Settings },
];

function initialsFor(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function Dashboard({ onNavigate, account, onLogout }) {
  const ownerName = account?.user?.name || "there";
  const businessName = account?.business?.name || "your business";
  const firstName = ownerName.split(" ")[0];
  const [dashboardData, setDashboardData] = useState(null);
  const [activeItem, setActiveItem] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadDashboard() {
      try {
        const data = await getDashboardData();
        if (!cancelled) setDashboardData(data);
      } catch {
        if (!cancelled) setDashboardData(FALLBACK_DASHBOARD);
      }
    }

    loadDashboard();
    return () => {
      cancelled = true;
    };
  }, [account?.business?.id]);

  const dashboard = dashboardData || FALLBACK_DASHBOARD;
  const customerCount =
    dashboard.stats.find((stat) => stat.icon === "customers")?.value || "0";

  function selectNavigation(item) {
    setActiveItem(item.id);
    setMobileMenuOpen(false);
    document
      .getElementById(item.id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="business-dashboard">
      <aside
        className={`business-dashboard__sidebar ${mobileMenuOpen ? "is-open" : ""}`}
      >
        <a
          href="/"
          className="business-dashboard__brand"
          onClick={(event) => {
            event.preventDefault();
            onNavigate?.("home");
          }}
        >
          <i />
          <strong>OXENO</strong>
          <span>STUDIO</span>
        </a>
        <div className="business-dashboard__mobile-title">
          <span>Workspace</span>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={18} />
          </button>
        </div>
        <div className="business-dashboard__workspace">
          <span>{initialsFor(businessName)}</span>
          <div>
            <small>YOUR WORKSPACE</small>
            <strong>{businessName}</strong>
          </div>
          <ChevronDown size={15} />
        </div>
        <nav
          className="business-dashboard__nav"
          aria-label="Business dashboard navigation"
        >
          {navigationItems.map(({ id, label, icon: Icon }) => (
            <button
              type="button"
              className={activeItem === id ? "is-active" : ""}
              key={id}
              onClick={() => selectNavigation({ id })}
            >
              <Icon size={18} />
              <span>{label}</span>
              {id === "campaigns" && <i>New</i>}
            </button>
          ))}
        </nav>
        <div className="business-dashboard__sidebar-foot">
          <button type="button" onClick={() => onNavigate?.("support")}>
            <CircleHelp size={17} /> Help and support
          </button>
          <div>
            <span />
            <p>
              <strong>All systems operational</strong>
              <small>Your member experience is live.</small>
            </p>
          </div>
        </div>
      </aside>
      {mobileMenuOpen && (
        <button
          className="business-dashboard__scrim"
          type="button"
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Close menu"
        />
      )}

      <div className="business-dashboard__content">
        <header className="business-dashboard__topbar">
          <button
            type="button"
            className="business-dashboard__menu"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={21} />
          </button>
          <div className="business-dashboard__topbar-title">
            <span>OPERATIONS OVERVIEW</span>
            <strong>Monday, August 3</strong>
          </div>
          <div className="business-dashboard__topbar-actions">
            <label className="business-dashboard__search">
              <BarChart3 size={16} />
              <input
                type="search"
                placeholder="Search your workspace"
                aria-label="Search your workspace"
              />
              <kbd>⌘ K</kbd>
            </label>
            <button
              type="button"
              className="business-dashboard__notification"
              aria-label="Notifications"
            >
              <Bell size={18} />
              <i />
            </button>
            <BusinessProfileMenu
              account={account}
              onNavigate={onNavigate}
              onLogout={onLogout}
            />
          </div>
        </header>

        <main className="business-dashboard__main">
          <section className="business-dashboard__hero" id="overview">
            <div className="business-dashboard__hero-copy">
              <span>
                <Sparkles size={14} /> Your customer experience, at a glance
              </span>
              <h1>Welcome back, {firstName}.</h1>
              <p>
                Turn every visit at {businessName} into a relationship your
                customers want to return to.
              </p>
              <button
                type="button"
                onClick={() => selectNavigation({ id: "rewards-studio" })}
              >
                Open rewards studio <ArrowUpRight size={16} />
              </button>
            </div>
            <div className="business-dashboard__hero-metric">
              <div>
                <span>Community reach</span>
                <strong>{customerCount}</strong>
                <p>customers in your world</p>
              </div>
              <i>
                <Users size={23} />
              </i>
              <small>
                <em /> Live customer data
              </small>
            </div>
          </section>

          <section
            className="business-dashboard__stats"
            aria-label="Business summary"
          >
            {dashboard.stats.map((stat, index) => (
              <StatCard key={stat.label} index={index} {...stat} />
            ))}
          </section>

          <div id="rewards-studio">
            <BusinessQuickActions />
          </div>

          <section className="business-dashboard__section-head" id="customers">
            <div>
              <span>CUSTOMER MOMENTS</span>
              <h2>Make every milestone feel personal.</h2>
            </div>
            <button type="button">
              Customer calendar <ArrowUpRight size={16} />
            </button>
          </section>
          <section className="business-dashboard__moments">
            <ListCard
              title="Upcoming birthdays"
              caption="Celebrate the people who choose you"
              icon={Cake}
              tone="coral"
              items={dashboard.upcomingBirthdays}
              detailKey="date"
              emptyMessage="No birthdays coming up in the next 14 days."
            />
            <ListCard
              title="Upcoming anniversaries"
              caption="Recognise their special moments"
              icon={CalendarHeart}
              tone="violet"
              items={dashboard.upcomingAnniversaries}
              detailKey="date"
              emptyMessage="No anniversaries coming up in the next 14 days."
            />
          </section>

          <section className="business-dashboard__activity" id="campaigns">
            <article className="business-dashboard__campaign-card">
              <CardHeading
                icon={Megaphone}
                title="Campaign activity"
                action="Manage campaigns"
              />
              {dashboard.activeCampaigns.length ? (
                <ul>
                  {dashboard.activeCampaigns.map((campaign) => (
                    <li key={campaign.name}>
                      <span className="business-dashboard__campaign-icon">
                        <Megaphone size={16} />
                      </span>
                      <div>
                        <strong>{campaign.name}</strong>
                        <p>{campaign.metric}</p>
                      </div>
                      <em
                        className={
                          campaign.status === "Live"
                            ? "is-live"
                            : "is-scheduled"
                        }
                      >
                        {campaign.status}
                      </em>
                      <ArrowUpRight size={16} />
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState
                  icon={Megaphone}
                  message="Your next campaign starts with a thoughtful message."
                />
              )}
            </article>
            <div className="business-dashboard__activity-side">
              <article className="business-dashboard__subscription-card">
                <CardHeading icon={CreditCard} title="Subscription" />
                <div>
                  <span>{dashboard.subscription.plan}</span>
                  <em>{dashboard.subscription.status}</em>
                </div>
                <p>Renews {dashboard.subscription.renews}</p>
                <button type="button">
                  Manage plan <ArrowUpRight size={14} />
                </button>
              </article>
              <article
                className="business-dashboard__usage-card"
                id="analytics"
              >
                <CardHeading
                  icon={ChartNoAxesCombined}
                  title="Usage this month"
                />
                <div>
                  {dashboard.usage.map((usage) => (
                    <UsageBar key={usage.label} {...usage} />
                  ))}
                </div>
              </article>
            </div>
          </section>

          <footer className="business-dashboard__footer">
            <span>OXENO BUSINESS</span>
            <p>Designed to make loyalty feel effortless.</p>
            <div>
              <button type="button">Privacy</button>
              <button type="button">Support</button>
              <button type="button" onClick={onLogout}>
                Log out
              </button>
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, sub, index }) {
  const Icon = typeof icon === "string" ? STAT_ICON_MAP[icon] || Users : icon;
  const tones = ["blue", "violet", "coral", "gold", "green", "pink"];
  return (
    <article
      className={`business-stat business-stat--${tones[index % tones.length]}`}
    >
      <span>
        <Icon size={19} />
      </span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{sub || "All time"}</small>
      </div>
    </article>
  );
}

function CardHeading({ icon: Icon, title, action }) {
  return (
    <div className="business-card-heading">
      <div>
        <span>
          <Icon size={17} />
        </span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button type="button">
          {action} <ArrowUpRight size={14} />
        </button>
      )}
    </div>
  );
}

function ListCard({
  title,
  caption,
  icon,
  tone,
  items,
  detailKey,
  emptyMessage,
}) {
  const Icon = icon;
  return (
    <article className={`business-moment-card business-moment-card--${tone}`}>
      <div className="business-moment-card__head">
        <span>
          <Icon size={20} />
        </span>
        <div>
          <h2>{title}</h2>
          <p>{caption}</p>
        </div>
        <button type="button">
          View all <ArrowUpRight size={14} />
        </button>
      </div>
      {items.length ? (
        <ul>
          {items.map((item) => (
            <li key={`${item.name}-${item[detailKey]}`}>
              <span>{initialsFor(item.name)}</span>
              <strong>
                {item.name}
                <small>{item.detail || "Customer milestone"}</small>
              </strong>
              <time>{item[detailKey]}</time>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState icon={Icon} message={emptyMessage} />
      )}
    </article>
  );
}

function EmptyState({ icon: Icon, message }) {
  return (
    <div className="business-empty-state">
      <span>
        <Icon size={18} />
      </span>
      <p>{message}</p>
    </div>
  );
}

function UsageBar({ label, used, limit, unit }) {
  const pct = Math.min(100, Math.round((used / limit) * 100));
  return (
    <div className="business-usage">
      <div>
        <span>{label}</span>
        <strong>
          {used.toLocaleString()} / {limit.toLocaleString()} {unit}
        </strong>
      </div>
      <p>
        <i style={{ width: `${pct}%` }} />
      </p>
    </div>
  );
}
