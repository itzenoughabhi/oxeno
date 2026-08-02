import { Award, BadgeIndianRupee, CalendarCheck2, Ticket } from "lucide-react";

export default function QuickStats({ experience }) {
  const stats = [
    {
      label: "Available coupons",
      value: "03",
      detail: "Ready to use",
      icon: Ticket,
      tone: "blue",
    },
    {
      label: "Loyalty points",
      value: experience.points.toLocaleString(),
      detail: "+24 this month",
      icon: Award,
      tone: "violet",
    },
    {
      label: "Total visits",
      value: String(Math.max(12, experience.visits.length)),
      detail: "Keep it going",
      icon: CalendarCheck2,
      tone: "coral",
    },
    {
      label: "Savings",
      value: "₹1,840",
      detail: "Member value",
      icon: BadgeIndianRupee,
      tone: "gold",
    },
  ];
  return (
    <section className="customer-stats" aria-label="Reward summary">
      {stats.map(({ icon: Icon, ...stat }) => (
        <article
          className={`customer-stat customer-stat--${stat.tone}`}
          key={stat.label}
        >
          <span>
            <Icon size={19} />
          </span>
          <div>
            <p>{stat.label}</p>
            <strong>{stat.value}</strong>
            <small>{stat.detail}</small>
          </div>
        </article>
      ))}
    </section>
  );
}
