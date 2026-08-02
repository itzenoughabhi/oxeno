// src/components/PricingPreview.jsx
import useReveal from "../../hooks/useReveal";
import "./PricingPreview.css";

const PLANS = [
  {
    name: "Starter",
    price: "$0",
    features: [
      "Up to 500 customers",
      "1 QR loyalty program",
      "Basic analytics",
    ],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Growth",
    price: "$49",
    badge: "Most Popular",
    features: [
      "Up to 10,000 customers",
      "Unlimited QR programs",
      "AI campaigns & automation",
      "Advanced analytics",
    ],
    cta: "Get Started",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    features: [
      "Unlimited customers",
      "Multi-store management",
      "Dedicated success manager",
    ],
    cta: "Contact Sales",
    highlight: false,
  },
];

function PriceCard({ plan, delay }) {
  const [ref, visible] = useReveal();
  const highlight = plan.highlight;

  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`price-card ${highlight ? "price-card--highlight" : ""} reveal ${visible ? "is-visible" : ""}`}
    >
      {plan.badge && <span className="price-card__badge">{plan.badge}</span>}

      <div className="price-card__name">{plan.name}</div>
      <div className="price-card__price">
        {plan.price}
        {plan.price !== "Custom" && (
          <span className="price-card__period">/mo</span>
        )}
      </div>

      <ul className="price-card__features">
        {plan.features.map((f) => (
          <li key={f} className="price-card__feature">
            <span
              className={`price-card__feature-icon ${highlight ? "price-card__feature-icon--highlight" : ""}`}
            >
              ✓
            </span>
            {f}
          </li>
        ))}
      </ul>

      <button
        className={`price-card__button ${highlight ? "price-card__button--highlight" : "price-card__button--ghost"}`}
      >
        {plan.cta}
      </button>
    </div>
  );
}

export default function PricingPreview() {
  const [headRef, headVisible] = useReveal();
  return (
    <section id="pricing" className="pricing">
      <div className="pricing__wrapper">
        <div
          ref={headRef}
          className={`pricing__header reveal ${headVisible ? "is-visible" : ""}`}
        >
          <span className="eyebrow">Pricing</span>
          <h2 className="pricing__title">Simple pricing that grows with you</h2>
          <p className="pricing__subtitle">
            Start free. Upgrade when your loyalty program starts paying for
            itself.
          </p>
        </div>

        <div className="pricing__grid">
          {PLANS.map((p, i) => (
            <PriceCard key={p.name} plan={p} delay={i * 100} />
          ))}
        </div>
      </div>
    </section>
  );
}
