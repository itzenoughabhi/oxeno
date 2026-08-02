// src/components/Navbar/BusinessProfileMenu.jsx
import { useState } from "react";
import { ChevronDown, LayoutDashboard, Settings, LogOut } from "lucide-react";
import "./BusinessProfileMenu.css";

function initialsFor(name) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function BusinessProfileMenu({
  account,
  onNavigate,
  onLogout,
  dashboardPage = "dashboard",
}) {
  const [open, setOpen] = useState(false);
  const name = account?.user?.name || "Account";
  const business = account?.business?.name || "Oxeno";

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
        <span className="profile-menu__avatar">{initialsFor(name)}</span>
        <span className="profile-menu__info">
          <span className="profile-menu__name">{name}</span>
          <span className="profile-menu__business">{business}</span>
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
              onClick={() => selectItem(() => onNavigate?.(dashboardPage))}
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
              onClick={() => selectItem(onLogout)}
            >
              <LogOut size={16} /> Log Out
            </button>
          </div>
        </>
      )}
    </div>
  );
}
