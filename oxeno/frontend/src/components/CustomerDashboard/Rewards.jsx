import { CakeSlice, Coffee, Gift, Sparkles, Star } from "lucide-react";
import { SectionHeading } from "./Offers.jsx";

const icons = {
  coffee: Coffee,
  cake: CakeSlice,
  spark: Sparkles,
  star: Star,
  gift: Gift,
};
export default function Rewards({
  rewards,
  points,
  onRedeemReward,
  claimedRewardIds,
}) {
  return (
    <section className="customer-section" id="rewards">
      <SectionHeading
        eyebrow="Choose your delight"
        title="Rewards waiting to be unlocked"
        action="Explore all rewards"
      />
      <div className="customer-rewards-grid">
        {rewards.map((reward) => {
          const Icon = icons[reward.icon];
          const unlocked = points >= reward.points;
          return (
            <article
              className={`customer-reward customer-reward--${reward.accent}`}
              key={reward.id}
            >
              <span className="customer-reward__icon">
                <Icon size={25} />
              </span>
              <span className="customer-reward__points">
                {reward.points} points
              </span>
              <h3>{reward.name}</h3>
              <p>
                {unlocked
                  ? "This reward is yours to enjoy."
                  : `${reward.points - points} points away`}
              </p>
              <button
                type="button"
                disabled={!unlocked}
                onClick={() => onRedeemReward(reward.id)}
              >
                {claimedRewardIds.includes(reward.id)
                  ? "Reward claimed"
                  : unlocked
                    ? "Redeem reward"
                    : "Keep earning"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
