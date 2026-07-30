// src/components/CTA.jsx
import useReveal from "../../hooks/useReveal";
import "./CTA.css";

export default function CTA() {
  const [ref, visible] = useReveal();

  return (
    <section className="cta">
      <div className="cta__wrapper">
        <div
          ref={ref}
          className={`cta__panel reveal ${visible ? "is-visible" : ""}`}
        >
          <div className="cta__glow cta__glow--top" />
          <div className="cta__glow cta__glow--bottom" />

          <div className="cta__content">
            <h2 className="cta__title">
              Ready to grow your business?
            </h2>
            <p className="cta__subtitle">
              Join thousands of businesses using Oxeno to turn one-time
              visitors into lifelong customers.
            </p>
            <div className="cta__actions">
              <button className="cta__button cta__button--primary">
                Start Free
              </button>
              <button className="cta__button cta__button--ghost">
                Book Demo
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}