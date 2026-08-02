import { useState } from "react";
import { Menu, X } from "lucide-react";
import BusinessProfileMenu from "./BusinessProfileMenu.jsx";
import "./Navbar.css";

const Navbar = ({ onNavigate, account, onLogout }) => {
  const [open, setOpen] = useState(false);

  const navLinks = [
    "Home",
    "Features",
    "Solutions",
    "Pricing",
    "Resources",
    "Contact",
  ];

  function go(page) {
    setOpen(false);
    onNavigate?.(page);
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        {/* Logo */}
        <a
          href="/"
          className="navbar__logo"
          onClick={(e) => {
            e.preventDefault();
            go("home");
          }}
        >
          <div className="navbar__logo-mark">
            <span className="navbar__logo-pulse" />
            <span className="navbar__logo-dot" />
          </div>

          <span className="navbar__logo-text">OXENO</span>
        </a>

        {/* Desktop Menu */}
        <nav className="navbar__links">
          {navLinks.map((item) => (
            <a
              key={item}
              href="#"
              className="navbar__link"
              onClick={(e) => {
                e.preventDefault();
                go("home");
              }}
            >
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="navbar__actions">
          {account ? (
            <BusinessProfileMenu
              account={account}
              onNavigate={go}
              onLogout={onLogout}
              dashboardPage={
                account.user?.role === "customer"
                  ? "customer-dashboard"
                  : "dashboard"
              }
            />
          ) : (
            <div className="navbar__guest-actions">
              <button className="navbar__login" onClick={() => go("login")}>
                Login
              </button>
              <button className="navbar__signup" onClick={() => go("signup")}>
                Sign Up
              </button>
              <button
                className="navbar__customer"
                onClick={() => go("customer-login")}
              >
                Customer
              </button>
            </div>
          )}
        </div>

        {/* Mobile Button */}
        <button
          onClick={() => setOpen(!open)}
          className={`navbar__toggle${open ? " open" : ""}`}
          aria-label="Toggle navigation"
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`navbar__mobile${open ? " open" : ""}`}>
        <div className="navbar__mobile-links">
          {navLinks.map((item) => (
            <a
              key={item}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                go("home");
              }}
              className="navbar__mobile-link"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="navbar__mobile-actions">
          {account ? (
            <BusinessProfileMenu
              account={account}
              onNavigate={go}
              onLogout={onLogout}
              dashboardPage={
                account.user?.role === "customer"
                  ? "customer-dashboard"
                  : "dashboard"
              }
            />
          ) : (
            <>
              <button
                className="navbar__mobile-button navbar__mobile-button--ghost"
                onClick={() => go("login")}
              >
                Login
              </button>
              <button
                className="navbar__mobile-button navbar__mobile-button--primary"
                onClick={() => go("signup")}
              >
                Sign Up
              </button>
              <button
                className="navbar__mobile-button navbar__mobile-button--ghost"
                onClick={() => go("customer-login")}
              >
                Customer Login
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
