// src/components/Testimonials.jsx
import useReveal from "../../hooks/useReveal";
import "./Testimonials.css";

const REVIEWS = [
  {
    quote:
      "Our repeat customer rate jumped within the first month. The QR check-in is so simple our staff barely had to explain it.",
    name: "Neha Kapoor",
    role: "Owner, Cafe Bloom",
  },
  {
    quote:
      "The AI campaigns feel like they were written by our own marketing team — except they run themselves.",
    name: "Arjun Mehta",
    role: "Founder, UrbanFit Studios",
  },
  {
    quote:
      "Managing loyalty across five locations used to be a mess. Oxeno gave us one dashboard for everything.",
    name: "Sana Iyer",
    role: "Ops Lead, GreenLeaf Retail",
  },
];

function ReviewCard({ quote, name, role, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`review-card reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="review-card__stars">★★★★★</div>
      <p className="review-card__quote">"{quote}"</p>
      <div className="review-card__meta">
        <div className="review-card__avatar" />
        <div>
          <div className="review-card__name">{name}</div>
          <div className="review-card__role">{role}</div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials() {
  const [headRef, headVisible] = useReveal();
  return (
    <section id="testimonials" className="testimonials">
      <div className="testimonials__wrapper">
        <div
          ref={headRef}
          className={`testimonials__header reveal ${headVisible ? "is-visible" : ""}`}
        >
          <span className="eyebrow">Testimonials</span>
          <h2 className="testimonials__title">Loved by growing businesses</h2>
          <p className="testimonials__subtitle">
            Real results from real business owners running their loyalty
            programs on Oxeno.
          </p>
        </div>

        <div className="testimonials__grid">
          {REVIEWS.map((r, i) => (
            <ReviewCard key={r.name} {...r} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
