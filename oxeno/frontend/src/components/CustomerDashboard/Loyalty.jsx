import { ArrowUpRight, CircleCheck, Medal } from "lucide-react";
import { SectionHeadSmall } from "./Coupons.jsx";
import { formatShortDate } from "./dashboardData.js";

export default function Loyalty({ experience }) {
  const milestones = [100, 180, 250, 500];
  return (
    <section
      className="customer-section customer-section--two-col"
      id="loyalty"
    >
      <div className="customer-panel customer-loyalty">
        <SectionHeadSmall
          icon={Medal}
          title="Loyalty journey"
          action="Program details"
        />
        <div className="customer-loyalty__score">
          <div>
            <span>Current balance</span>
            <strong>
              {experience.points}
              <small>pts</small>
            </strong>
          </div>
          <span className="customer-loyalty__coin">
            <Medal size={26} />
          </span>
        </div>
        <div className="customer-loyalty__line">
          <i style={{ width: `${Math.min(100, experience.points / 5)}%` }} />
        </div>
        <div className="customer-loyalty__milestones">
          {milestones.map((point) => (
            <div
              className={experience.points >= point ? "is-unlocked" : ""}
              key={point}
            >
              <i>
                {experience.points >= point ? <CircleCheck size={15} /> : null}
              </i>
              <strong>{point}</strong>
              <span>
                {point === 100
                  ? "Coffee"
                  : point === 180
                    ? "Dessert"
                    : point === 250
                      ? "10% off"
                      : "Half off"}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div className="customer-panel customer-history">
        <SectionHeadSmall
          icon={Medal}
          title="Reward history"
          action="View all"
        />
        <div>
          {experience.loyaltyHistory.map((event, index) => (
            <article
              className="customer-history__item"
              key={`${event.createdAt}-${index}`}
            >
              <span className="customer-history__mark">+{event.points}</span>
              <div>
                <strong>{event.note || "Loyalty points added"}</strong>
                <p>
                  {event.programName} · {formatShortDate(event.createdAt)}
                </p>
              </div>
              <ArrowUpRight size={15} />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
