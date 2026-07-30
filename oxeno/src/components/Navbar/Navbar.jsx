import { useState } from "react";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  const navLinks = [
    "Home",
    "Features",
    "Solutions",
    "Pricing",
    "Resources",
    "Contact",
  ];

  return (
    <header className="navbar">
      <div className="navbar__inner container">

        {/* Logo */}
        <a href="/" className="navbar__logo">
          <div className="navbar__logo-mark">
            <span className="navbar__logo-pulse" />
            <span className="navbar__logo-dot" />
          </div>

          <span className="navbar__logo-text">OXENO</span>
        </a>

        {/* Desktop Menu */}
        <nav className="navbar__links">
          {navLinks.map((item) => (
            <a key={item} href="#" className="navbar__link">
              {item}
            </a>
          ))}
        </nav>

        {/* Desktop Buttons */}
        <div className="navbar__actions">
          <button className="navbar__login">Login</button>
          <button className="navbar__cta">Get Started</button>
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
              onClick={() => setOpen(false)}
              className="navbar__mobile-link"
            >
              {item}
            </a>
          ))}
        </div>

        <div className="navbar__mobile-actions">
          <button className="navbar__mobile-button navbar__mobile-button--ghost">
            Login
          </button>
          <button className="navbar__mobile-button navbar__mobile-button--primary">
            Get Started
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;