import { CreditCard, ShieldCheck } from "lucide-react";

function FauxQr() {
  const cells = Array.from({ length: 49 }, (_, index) => index);
  return (
    <span className="customer-membership__qr">
      {cells.map((cell) => (
        <i
          className={
            [
              0, 1, 2, 7, 9, 14, 18, 19, 21, 22, 23, 27, 28, 30, 35, 39, 40, 41,
              45, 46, 48,
            ].includes(cell)
              ? "is-dark"
              : ""
          }
          key={cell}
        />
      ))}
    </span>
  );
}
export default function MembershipCard({ experience }) {
  return (
    <section className="customer-section customer-section--two-col">
      <div className="customer-membership">
        <div className="customer-membership__orbit" />
        <div className="customer-membership__top">
          <span>
            <CreditCard size={17} /> OXENO MEMBER
          </span>
          <ShieldCheck size={20} />
        </div>
        <div className="customer-membership__name">
          <strong>{experience.customer.name}</strong>
          <span>{experience.membership.toUpperCase()} · REWARDS</span>
        </div>
        <div className="customer-membership__bottom">
          <div>
            <small>MEMBERSHIP NO.</small>
            <strong>OXN • 4829 • 7216</strong>
          </div>
          <div>
            <small>VALID THROUGH</small>
            <strong>08 / 27</strong>
          </div>
          <FauxQr />
        </div>
      </div>
      <div className="customer-store-info">
        <span>YOUR HOME STORE</span>
        <div className="customer-store-info__title">
          <i>{experience.business.initials}</i>
          <div>
            <h2>{experience.business.name}</h2>
            <p>
              {experience.business.category} · {experience.business.city}
            </p>
          </div>
        </div>
        <dl>
          <div>
            <dt>Today</dt>
            <dd>10:00 AM – 10:30 PM</dd>
          </div>
          <div>
            <dt>Contact</dt>
            <dd>Available in your wallet</dd>
          </div>
        </dl>
        <div className="customer-store-info__links">
          <button type="button">Call</button>
          <button type="button">Directions</button>
          <button type="button">Website</button>
        </div>
      </div>
    </section>
  );
}
