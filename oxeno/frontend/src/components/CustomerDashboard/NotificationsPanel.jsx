import { Bell } from "lucide-react";
import { notificationItems } from "./dashboardData.js";

export default function NotificationsPanel() {
  return (
    <section
      className="customer-section customer-section--two-col"
      id="notifications"
    >
      <div className="customer-panel">
        <div className="customer-notifications__head">
          <div>
            <span>
              <Bell size={17} />
            </span>
            <h2>In your world</h2>
          </div>
          <button type="button">Mark all as read</button>
        </div>
        <div className="customer-notifications">
          {notificationItems.map(({ icon: Icon, ...item }) => (
            <article key={item.title}>
              <span
                className={`customer-notifications__icon customer-notifications__icon--${item.tone}`}
              >
                <Icon size={17} />
              </span>
              <div>
                <strong>{item.title}</strong>
                <p>{item.body}</p>
              </div>
              <time>{item.time}</time>
            </article>
          ))}
        </div>
      </div>
      <div className="customer-notification-spotlight">
        <span>Member moments</span>
        <h2>New benefits are always around the corner.</h2>
        <p>
          Turn on notifications to never miss an offer, reward or celebration.
        </p>
        <button type="button">Notification settings</button>
      </div>
    </section>
  );
}
