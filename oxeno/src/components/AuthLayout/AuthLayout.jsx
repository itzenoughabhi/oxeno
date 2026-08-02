// src/components/AuthLayout/AuthLayout.jsx
import "./AuthLayout.css";

const HIGHLIGHTS = [
  { icon: "📊", label: "Analytics", value: "Live Insights" },
  { icon: "💰", label: "Revenue", value: "$84,290" },
  { icon: "🎁", label: "Loyalty", value: "1,204 Points" },
];

export default function AuthLayout({ onNavigate, children }) {
  function goHome(e) {
    e.preventDefault();
    onNavigate?.("home");
  }

  return (
    <div className="auth-layout">
      {/* Left: branding / advertisement panel (hidden on small screens) */}
      <aside className="auth-layout__brand">
        <div className="auth-layout__blob auth-layout__blob--1" />
        <div className="auth-layout__blob auth-layout__blob--2" />

        <a href="/" className="auth-layout__logo" onClick={goHome}>
          <span className="auth-layout__logo-dot" />
          <span className="auth-layout__logo-text">OXENO</span>
        </a>

        <div className="auth-layout__brand-content">
          <span className="auth-layout__eyebrow">AI Customer Growth OS</span>
          <h1 className="auth-layout__headline">
            Turn Every Customer Visit Into{" "}
            <span className="auth-layout__headline-accent">Loyalty Growth AI</span>
          </h1>
          <p className="auth-layout__text">
            Oxeno helps businesses retain customers through AI-powered
            campaigns, QR-powered loyalty, smart automation, and real-time
            analytics.
          </p>

          <div className="auth-layout__highlights">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label} className="auth-layout__highlight">
                <span className="auth-layout__highlight-icon">{h.icon}</span>
                <div>
                  <div className="auth-layout__highlight-label">{h.label}</div>
                  <div className="auth-layout__highlight-value">{h.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="auth-layout__proof">
          <strong>10,000+</strong> businesses already growing with Oxeno
        </p>
      </aside>

      {/* Right: the actual login / sign-up form */}
      <main className="auth-layout__form">
        <div className="auth-layout__form-col">
          <a href="/" className="auth-layout__mobile-logo" onClick={goHome}>
            <span className="auth-layout__mobile-logo-dot" />
            <span className="auth-layout__mobile-logo-text">OXENO</span>
          </a>

          {children}
        </div>
      </main>
    </div>
  );
}