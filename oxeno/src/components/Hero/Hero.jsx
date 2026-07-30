// src/components/Hero.jsx
import useReveal from "../../hooks/useReveal";
import "./Hero.css";

export default function Hero() {
  const [ref, visible] = useReveal();

  return (
    <section id="home" className="hero">
      <div className="hero__blob hero__blob--1" />
      <div className="hero__blob hero__blob--2" />

      <div ref={ref} className={`hero__inner reveal ${visible ? "is-visible" : ""}`}>
        <div className="hero__content">
          <span className="hero__eyebrow">AI Customer Growth OS</span>

          <h1 className="hero__title">
            Turn Every Customer Visit Into{' '}
            <span className="text-gradient">Loyalty Growth AI</span>
          </h1>

          <p className="hero__subtext">
            Oxeno helps businesses retain customers through AI-powered campaigns,
            QR-powered loyalty, smart automation, and real-time analytics.
          </p>

          <div className="hero__actions">
            <button className="btn btn-primary btn-lg">Start Free</button>
            <button className="btn btn-secondary btn-lg">Book Demo</button>
          </div>

          <div className="hero__proof">
            <div className="hero__proof-avatars">
              {[...Array(4)].map((_, i) => (
                <span key={i} />
              ))}
            </div>
            <p className="hero__proof-text">
              <strong>10,000+</strong> businesses already growing with Oxeno
            </p>
          </div>
        </div>

        <div className="hero__visual">
          <div className="dash-mock">
            <div className="dash-mock__top">
              <span className="dash-mock__dot" />
              <span className="dash-mock__dot" />
              <span className="dash-mock__dot" />
            </div>
            <div className="dash-mock__body">
              <div className="dash-mock__chart">
                {[40, 65, 50, 85, 60, 95, 70].map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}%` }}
                    className="dash-mock__bar"
                  />
                ))}
              </div>

              <div className="dash-mock__stat">
                <div className="label">Revenue Growth</div>
                <div className="value">+20.4%</div>
                <div className="delta">↑ vs last month</div>
              </div>
              <div className="dash-mock__stat">
                <div className="label">Repeat Customers</div>
                <div className="value">64.2%</div>
                <div className="delta">↑ 8.1%</div>
              </div>
            </div>
          </div>

          <div className="float-card fc-analytics">
            <span className="ic">📊</span>
            <div className="txt">
              <div className="t">Analytics</div>
              <div className="v">Live Insights</div>
            </div>
          </div>

          <div className="float-card fc-revenue">
            <span className="ic">💰</span>
            <div className="txt">
              <div className="t">Revenue</div>
              <div className="v">$84,290</div>
            </div>
          </div>

          <div className="float-card fc-loyalty">
            <span className="ic">🎁</span>
            <div className="txt">
              <div className="t">Loyalty</div>
              <div className="v">1,204 Points</div>
            </div>
          </div>

          <div className="float-card fc-campaign">
            <span className="ic">🚀</span>
            <div className="txt">
              <div className="t">Campaign</div>
              <div className="v">92% Open Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}