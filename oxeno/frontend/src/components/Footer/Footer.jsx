import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2 className="footer-logo">OXENO</h2>
          <p>
            AI-powered Customer Growth Platform that helps businesses increase
            customer retention, loyalty, and engagement through smart
            automation.
          </p>
          <div className="social-icons">
            <a href="#">
              <i className="fab fa-facebook-f"></i>
            </a>
            <a href="#">
              <i className="fab fa-instagram"></i>
            </a>
            <a href="#">
              <i className="fab fa-linkedin-in"></i>
            </a>
            <a href="#">
              <i className="fab fa-x-twitter"></i>
            </a>
          </div>
        </div>
        <div className="footer-section">
          <h3>Product</h3>
          <ul>
            <li>
              <a href="#">Features</a>
            </li>
            <li>
              <a href="#">Pricing</a>
            </li>
            <li>
              <a href="#">Find Store</a>
            </li>
            <li>
              <a href="#">QR Solution</a>
            </li>
            <li>
              <a href="#">AI Automation</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Company</h3>
          <ul>
            <li>
              <a href="#">About Us</a>
            </li>
            <li>
              <a href="#">Careers</a>
            </li>
            <li>
              <a href="#">Blogs</a>
            </li>
            <li>
              <a href="#">Contact</a>
            </li>
            <li>
              <a href="#">Support</a>
            </li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact</h3>
          <p>📧 support@oxeno.ai</p>
          <p>📞 +91 98765 43210</p>
          <p>📍 Maharashtra, India</p>
          <button className="footer-btn">Request Demo</button>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 Oxeno AI. All Rights Reserved.</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Terms of Service</a>
          <a href="#">Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
