import { ArrowUpRight, Clock3 } from "lucide-react";
import { formatShortDate } from "./dashboardData.js";

export default function Offers({ offers, onRedeem, redeemedOfferIds }) {
  return (
    <section className="customer-section" id="offers">
      <SectionHeading
        eyebrow="Member exclusives"
        title="Offers selected for you"
        action="See all offers"
      />
      <div className="customer-offers-grid">
        {offers.map((offer) => (
          <article
            className={`customer-offer-card customer-offer-card--${offer.tone}`}
            key={offer.id}
          >
            <div className="customer-offer-card__art">
              <span />
              <span />
              <span />
            </div>
            <div className="customer-offer-card__body">
              <span className="customer-offer-card__discount">
                {offer.discountLabel}
              </span>
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <div className="customer-offer-card__foot">
                <span>
                  <Clock3 size={14} /> Ends {formatShortDate(offer.expiresAt)}
                </span>
                <button type="button" onClick={() => onRedeem(offer.id)}>
                  {redeemedOfferIds.includes(offer.id) ? "Saved" : "Redeem"}{" "}
                  <ArrowUpRight size={15} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export function SectionHeading({ eyebrow, title, action }) {
  return (
    <div className="customer-section__head">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button type="button">
          {action} <ArrowUpRight size={16} />
        </button>
      )}
    </div>
  );
}
