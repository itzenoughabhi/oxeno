import { ArrowUpRight, MapPin } from "lucide-react";
import { SectionHeading } from "./Offers.jsx";
import { formatLongDate } from "./dashboardData.js";

export default function VisitHistory({ experience }) {
  return (
    <section className="customer-section" id="visits">
      <SectionHeading
        eyebrow="Your moments"
        title="Visit history"
        action="See all visits"
      />
      <div className="customer-visits">
        {experience.visits.map((visit) => (
          <article className="customer-visit" key={visit.id}>
            <span className="customer-visit__dot" />
            <div className="customer-visit__date">
              <strong>{formatLongDate(visit.date)}</strong>
              <span>12:30 PM</span>
            </div>
            <div className="customer-visit__store">
              <span>
                <MapPin size={15} />
              </span>
              <div>
                <strong>{experience.business.name}</strong>
                <p>{visit.programName || experience.business.city}</p>
              </div>
            </div>
            <div className="customer-visit__amount">
              <strong>{visit.amount}</strong>
              <span>
                {visit.points ? `+${visit.points} points` : "Visit recorded"}
              </span>
            </div>
            <button type="button" aria-label="View visit details">
              <ArrowUpRight size={17} />
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
