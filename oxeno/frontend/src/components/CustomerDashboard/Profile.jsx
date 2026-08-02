import { Edit3, Mail, MapPin, Phone } from "lucide-react";
import { formatLongDate } from "./dashboardData.js";

export default function Profile({ customer, membership }) {
  const details = [
    { icon: Phone, label: "Mobile", value: customer.mobile },
    { icon: Mail, label: "Email", value: customer.email },
    { icon: MapPin, label: "City", value: customer.city },
    {
      icon: Edit3,
      label: "Birthday",
      value: formatLongDate(customer.birthDate),
    },
  ];
  return (
    <section className="customer-section" id="profile">
      <div className="customer-profile">
        <div className="customer-profile__identity">
          <span>{customer.name.slice(0, 1)}</span>
          <div>
            <h2>{customer.name}</h2>
            <p>Member since {customer.memberSince}</p>
            <i>{membership} member</i>
          </div>
        </div>
        <button type="button">
          <Edit3 size={16} /> Edit profile
        </button>
      </div>
      <div className="customer-profile__details">
        {details.map(({ icon: Icon, ...detail }) => (
          <article key={detail.label}>
            <span>
              <Icon size={17} />
            </span>
            <p>{detail.label}</p>
            <strong>{detail.value}</strong>
          </article>
        ))}
        {customer.isMarried && (
          <article>
            <span>♡</span>
            <p>Anniversary</p>
            <strong>{formatLongDate(customer.anniversaryDate)}</strong>
          </article>
        )}
      </div>
    </section>
  );
}
