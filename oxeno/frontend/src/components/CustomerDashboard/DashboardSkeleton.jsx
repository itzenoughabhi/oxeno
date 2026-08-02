export default function DashboardSkeleton() {
  return (
    <div className="customer-skeleton" aria-label="Loading customer dashboard">
      <div className="customer-skeleton__hero" />
      <div className="customer-skeleton__stats">
        {Array.from({ length: 4 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
      <div className="customer-skeleton__cards">
        {Array.from({ length: 3 }, (_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}
