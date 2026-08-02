// src/components/Features.jsx
import useReveal from "../../hooks/useReveal";
import "./Features.css";

const FEATURES = [
  {
    icon: "📱",
    title: "Smart QR",
    desc: "Generate dynamic QR codes customers scan to check in, earn points, and unlock offers instantly.",
  },
  {
    icon: "🏆",
    title: "Loyalty Rewards",
    desc: "Build tiered reward programs that keep customers coming back for more, automatically.",
  },
  {
    icon: "🤖",
    title: "AI Campaigns",
    desc: "Let AI write, time, and send campaigns tuned to each customer's behavior.",
  },
  {
    icon: "📈",
    title: "Customer Insights",
    desc: "See exactly who's returning, who's at risk of churning, and what drives them back.",
  },
  {
    icon: "⭐",
    title: "Reviews",
    desc: "Turn happy customers into 5-star reviews with automated, perfectly-timed requests.",
  },
  {
    icon: "🏬",
    title: "Multi Store",
    desc: "Manage loyalty and campaigns across every location from a single dashboard.",
  },
];

function FeatureCard({ icon, title, desc, delay }) {
  const [ref, visible] = useReveal();
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      className={`feature-card reveal ${visible ? "is-visible" : ""}`}
    >
      <div className="feature-card__icon">{icon}</div>
      <h3 className="font-display text-lg font-semibold text-ink-900">
        {title}
      </h3>
      <p className="mt-2.5 text-sm text-ink-500">{desc}</p>
    </div>
  );
}

export default function Features() {
  const [headRef, headVisible] = useReveal();
  return (
    <section id="features" className="features">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div
          ref={headRef}
          className={`max-w-xl mx-auto text-center mb-16 transition-all duration-700 ${
            headVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <span className="platform-badge">Platform</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink-900 mt-4">
            Everything you need to grow repeat customers
          </h2>
          <p className="mt-4 text-lg text-ink-700">
            One connected system for QR loyalty, AI campaigns and the analytics
            that tell you what's working.
          </p>
        </div>

        <div className="features__grid">
          {FEATURES.map((f, i) => (
            <FeatureCard key={f.title} {...f} delay={i * 90} />
          ))}
        </div>
      </div>
    </section>
  );
}
