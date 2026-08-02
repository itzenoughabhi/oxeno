import { ArrowUpRight, BadgeCheck, Sparkles } from "lucide-react";

export default function HeroCard({ experience, onRedeem, redeemed }) {
  const offer = experience.offers[0];
  const progress = Math.min(
    100,
    Math.round((experience.points / experience.nextReward) * 100),
  );

  return (
    <section className="customer-hero" id="overview">
      <div className="customer-hero__glow customer-hero__glow--one" />
      <div className="customer-hero__glow customer-hero__glow--two" />
      <div className="customer-hero__content">
        <span className="customer-hero__eyebrow">
          <Sparkles size={14} /> Your reward space
        </span>
        <h1>
          Welcome back, {experience.firstName}
          <span> 👋</span>
        </h1>
        <p>Every visit brings your next little delight closer.</p>
        <div className="customer-hero__tier">
          <BadgeCheck size={16} /> {experience.membership} member
        </div>
        <div className="customer-hero__meter">
          <div>
            <strong>{experience.points.toLocaleString()} loyalty points</strong>
            <span>{experience.remaining} points to your next reward</span>
          </div>
          <div className="customer-progress">
            <i style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
      <aside className="customer-hero__offer">
        <span>Today’s offer</span>
        <strong>{offer.discountLabel}</strong>
        <p>{offer.title}</p>
        <button
          className="customer-button customer-button--light"
          type="button"
          onClick={onRedeem}
        >
          {redeemed ? "Saved to your wallet" : "Redeem now"}{" "}
          <ArrowUpRight size={16} />
        </button>
      </aside>
    </section>
  );
}
