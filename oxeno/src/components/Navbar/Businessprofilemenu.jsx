// src/components/Navbar/BusinessProfileMenu.jsx
import { useState } from "react";
import { ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";
import "./BusinessProfileMenu.css";

// TODO: replace with the real authenticated business owner once auth/API is wired up.
export const OWNER = {
  name: "Aarav Sharma",
  business: "Cafe Bloom",
  initials: "AS",
};

export default function BusinessProfileMenu({ onNavigate }) {
  const [open, setOpen] = useState(false);

  function selectItem(action) {
    setOpen(false);
    action?.();
  }

  return (
    <div className="profile-menu">
      <button
        type="button"
        className="profile-menu__trigger"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="profile-menu__avatar">{OWNER.initials}</span>
        <span className="profile-menu__info">
          <span className="profile-menu__name">{OWNER.name}</span>
          <span className="profile-menu__business">{OWNER.business}</span>
        </span>
        <ChevronDown
          size={16}
          className={`profile-menu__chevron ${open ? "is-open" : ""}`}
        />
      </button>

      {open && (
        <>
          {/* Click-catcher to close the menu when clicking outside it */}
          <button
            type="button"
            className="profile-menu__backdrop"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="profile-menu__dropdown">
            <button
              type="button"
              className="profile-menu__item"
              onClick={() => selectItem(() => onNavigate?.("dashboard"))}
            >
              <LayoutDashboard size={16} /> Dashboard
            </button>
            <button
              type="button"
              className="profile-menu__item"
              onClick={() => selectItem(() => onNavigate?.("settings"))}
            >
              <Settings size={16} /> Account Settings
            </button>
            <hr className="profile-menu__divider" />
            <button
              type="button"
              className="profile-menu__item profile-menu__item--danger"
              onClick={() => selectItem(() => onNavigate?.("home"))} // TODO: real logout
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}