import { LogOut, X } from "lucide-react";
import { navigationItems } from "./dashboardData.js";

export default function CustomerSidebar({
  activeSection,
  onNavigate,
  onLogout,
  mobileOpen,
  onClose,
}) {
  return (
    <aside className={`customer-shell__sidebar ${mobileOpen ? "is-open" : ""}`}>
      <div className="customer-sidebar__brand">
        <i /> <strong>OXENO</strong>
        <span>MEMBERS</span>
      </div>
      <div className="customer-sidebar__mobile-head">
        <span>Explore Oxeno</span>
        <button
          type="button"
          className="customer-icon-button"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={19} />
        </button>
      </div>
      <nav
        className="customer-sidebar__nav"
        aria-label="Customer dashboard navigation"
      >
        {navigationItems.map(({ id, label, icon: Icon }) => (
          <button
            className={`customer-sidebar__link ${activeSection === id ? "is-active" : ""}`}
            key={id}
            type="button"
            onClick={() => onNavigate(id)}
          >
            <Icon size={18} strokeWidth={1.9} />
            <span>{label}</span>
            {id === "notifications" && <i>3</i>}
          </button>
        ))}
      </nav>
      <div className="customer-sidebar__foot">
        <button
          className="customer-sidebar__link"
          type="button"
          onClick={() => onNavigate("support")}
        >
          <span className="customer-sidebar__support-dot" />
          <span>We are here to help</span>
        </button>
        <button
          className="customer-sidebar__logout"
          type="button"
          onClick={onLogout}
        >
          <LogOut size={17} /> Log out
        </button>
      </div>
    </aside>
  );
}
