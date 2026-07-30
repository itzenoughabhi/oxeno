// src/components/QRCodeSection.jsx
import useReveal from "../../hooks/useReveal";
import "./QRCodeSection.css";

const BENEFITS = [
  "Customers check in and earn points in under 3 seconds",
  "Works on any table, receipt, packaging, or storefront",
  "Every scan feeds real-time customer analytics",
  "Triggers automated follow-up offers and campaigns",
];

export default function QRCodeSection() {
  const [ref, visible] = useReveal();

  return (
    <section id="qr" className="qr-section">
      <div
        ref={ref}
        className={`qr-section__inner reveal ${visible ? "is-visible" : ""}`}
      >
        {/* Left */}
        <div>
          <span className="qr-section__eyebrow">Solutions</span>
          <h2 className="qr-section__title">
            One Scan. Unlimited Possibilities.
          </h2>
          <p className="qr-section__desc">
            A single QR code turns every visit into a loyalty moment — no
            app download, no friction, just a scan.
          </p>

          <ul className="qr-benefits">
            {BENEFITS.map((b) => (
              <li key={b} className="qr-benefits__item">
                <span className="check">✓</span>
                {b}
              </li>
            ))}
          </ul>

          <button className="btn btn-primary btn-lg qr-section__cta">
            Generate QR
          </button>
        </div>

        {/* Right: QR card + phone */}
        <div className="qr-visual">
          <div className="qr-card">
            <div className="qr-card__code" />
            <p className="qr-card__label">
              Scan to earn 50 points
            </p>
          </div>

          <div className="qr-phone">
            <div className="qr-phone__screen">
              <span />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}