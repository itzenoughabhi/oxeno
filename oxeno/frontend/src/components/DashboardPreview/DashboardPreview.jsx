// src/components/DashboardPreview.jsx
import useReveal from "../../hooks/useReveal";
import "./DashboardPreview.css";

export default function DashboardPreview({ account }) {
  const [headRef, headVisible] = useReveal();
  const [panelRef, panelVisible] = useReveal();
  const userName = account?.user?.name || "A customer";

  return (
    <section className="dashboard-section">
      <div className="max-w-[1240px] mx-auto px-6 md:px-10">
        <div
          ref={headRef}
          className={`max-w-xl mx-auto text-center mb-14 transition-all duration-700 ${
            headVisible
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-6"
          }`}
        >
          <span className="product-badge">Product</span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-ink-900 mt-4">
            A dashboard built for growth decisions
          </h2>
          <p className="mt-4 text-lg text-ink-700">
            Analytics, campaigns, and customer data in one clean view — the way
            founders and marketers actually work.
          </p>
        </div>

        <div
          ref={panelRef}
          className={`dashboard-panel reveal ${panelVisible ? "is-visible" : ""}`}
        >
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl" />

          <div className="dashboard-grid">
            <div className="flex flex-col gap-5">
              <div className="dpanel">
                <h4>Revenue Chart</h4>
                <div className="chart-bars">
                  {[35, 55, 40, 70, 50, 90, 65, 100].map((h, i) => (
                    <div
                      key={i}
                      style={{ height: `${h}%` }}
                      className="chart-bar"
                    />
                  ))}
                </div>
              </div>

              <div className="dpanel">
                <h4>Campaigns</h4>
                <div className="dlist">
                  {[
                    ["Weekend Loyalty Boost", "92% opened"],
                    ["Win-back: 30-day inactive", "44% redeemed"],
                    ["New store launch offer", "Scheduled"],
                  ].map(([a, b]) => (
                    <div key={a} className="row">
                      <span>{a}</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div className="dpanel">
                <h4>Customer List</h4>
                <div className="dlist">
                  {[
                    [userName, "Gold · 12 visits"],
                    ["Priya Nair", "Silver · 6 visits"],
                    ["Rohit Verma", "Gold · 19 visits"],
                  ].map(([a, b]) => (
                    <div key={a} className="row">
                      <span>{a}</span>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ai-badge">
                🤖 AI Recommendation: send a re-engagement offer to 214
                customers inactive 21+ days
              </div>

              <div className="dashboard-phone">
                <div className="dashboard-phone__screen">
                  <div className="pill">Repeat Customers</div>
                  <div className="font-display text-2xl font-bold">64.2%</div>
                  <div className="pill">Loyalty Points</div>
                  <div className="pill">AI Campaigns Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
