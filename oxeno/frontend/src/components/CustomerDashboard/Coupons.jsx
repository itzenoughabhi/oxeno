import { Check, Copy, Ticket } from "lucide-react";

export default function Coupons({ onCopy, copied }) {
  const coupons = [
    {
      code: "WEEKEND20",
      title: "Flat 20% off your next bill",
      expiry: "4 days left",
      state: "Active",
    },
    {
      code: "BIRTHDAY",
      title: "A birthday dessert is on us",
      expiry: "Valid all month",
      state: "Active",
    },
    {
      code: "WELCOME10",
      title: "Welcome member savings",
      expiry: "Used on Jul 18",
      state: "Used",
    },
  ];
  return (
    <section
      className="customer-section customer-section--two-col"
      id="coupons"
    >
      <div className="customer-panel">
        <SectionHeadSmall
          icon={Ticket}
          title="Your coupons"
          action="View wallet"
        />{" "}
        <div className="customer-coupon-list">
          {coupons.map((coupon) => (
            <article
              className={`customer-coupon customer-coupon--${coupon.state.toLowerCase()}`}
              key={coupon.code}
            >
              <div>
                <span>{coupon.state}</span>
                <h3>{coupon.title}</h3>
                <p>{coupon.expiry}</p>
              </div>
              <button type="button" onClick={() => onCopy(coupon.code)}>
                {copied === coupon.code ? (
                  <Check size={16} />
                ) : (
                  <Copy size={16} />
                )}
                <strong>{coupon.code}</strong>
              </button>
            </article>
          ))}
        </div>
      </div>
      <div className="customer-coupon-progress">
        <span>Member wallet</span>
        <h2>
          Two bright moments
          <br />
          ready for you.
        </h2>
        <p>Use one today, and your next visit may unlock a new surprise.</p>
        <div>
          <i />
          <i />
          <i />
        </div>
        <strong>2 active coupons</strong>
      </div>
    </section>
  );
}

export function SectionHeadSmall({ icon: Icon, title, action }) {
  return (
    <div className="customer-panel__head">
      <div>
        <span>
          <Icon size={17} />
        </span>
        <h2>{title}</h2>
      </div>
      {action && <button type="button">{action}</button>}
    </div>
  );
}
