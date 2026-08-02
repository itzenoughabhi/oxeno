import { Bell, ChevronDown, LogOut, Menu, Search } from "lucide-react";

export default function CustomerNavbar({
  business,
  customer,
  onMenu,
  onNotifications,
  onProfile,
  onLogout,
  unreadCount,
}) {
  return (
    <header className="customer-navbar">
      <button
        type="button"
        className="customer-navbar__menu customer-icon-button"
        onClick={onMenu}
        aria-label="Open menu"
      >
        <Menu size={21} />
      </button>
      <div className="customer-navbar__store">
        <span className="customer-navbar__store-logo">{business.initials}</span>
        <div>
          <span className="customer-navbar__label">Your rewards at</span>
          <strong>{business.name}</strong>
        </div>
        <ChevronDown size={16} />
      </div>
      <label className="customer-navbar__search">
        <Search size={18} />
        <input
          type="search"
          placeholder="Search rewards, offers..."
          aria-label="Search rewards and offers"
        />
        <kbd>⌘ K</kbd>
      </label>
      <div className="customer-navbar__actions">
        <button
          type="button"
          className="customer-icon-button customer-navbar__bell"
          onClick={onNotifications}
          aria-label="Open notifications"
        >
          <Bell size={19} />
          {unreadCount > 0 && <span>{unreadCount}</span>}
        </button>
        <button
          type="button"
          className="customer-navbar__profile"
          onClick={onProfile}
        >
          <span>{customer.name.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{customer.name}</strong>
            <small>{customer.email}</small>
          </div>
          <ChevronDown size={16} />
        </button>
        <button
          type="button"
          className="customer-navbar__logout"
          onClick={onLogout}
        >
          <LogOut size={16} />
          <span>Log out</span>
        </button>
      </div>
    </header>
  );
}
