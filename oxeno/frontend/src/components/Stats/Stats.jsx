// src/components/Stats.jsx
import { useEffect, useRef, useState } from "react";
import "./Stats.css";

const STATS = [
  { value: 10, suffix: "K+", label: "Businesses" },
  { value: 1, suffix: "M+", label: "Customers" },
  { value: 50, suffix: "M+", label: "Offers Redeemed" },
  { value: 20, suffix: "%", label: "Revenue Growth" },
];

function Counter({ value, suffix }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          const duration = 1400;
          const start = performance.now();
          const tick = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(value * eased);
            if (progress < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          observer.unobserve(el);
        }
      },
      { threshold: 0.4 },
    );
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, [started, value]);

  return (
    <div ref={ref} className="stat__value">
      {Number.isInteger(value) ? Math.round(display) : display.toFixed(1)}
      {suffix}
    </div>
  );
}

export default function Stats() {
  return (
    <section className="stats">
      <div className="stats__grid">
        {STATS.map((s) => (
          <div key={s.label} className="stat">
            <Counter value={s.value} suffix={s.suffix} />
            <p className="stat__label">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
