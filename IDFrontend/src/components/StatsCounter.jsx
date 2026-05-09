import { useEffect, useRef, useState } from 'react';

const STATS = [
  { value: 5000, suffix: '+', label: 'Happy Clients',      icon: '😊' },
  { value: 50,   suffix: '+', label: 'Product Categories', icon: '📦' },
  { value: 10,   suffix: '+', label: 'Years in Business',  icon: '🏅' },
  { value: 100,  suffix: '%', label: 'Satisfaction Rate',  icon: '⭐' },
];

function useCountUp(target, duration = 1800, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

function StatItem({ stat, animate }) {
  const count = useCountUp(stat.value, 1800, animate);
  return (
    <div className="flex flex-col items-center px-6 py-8">
      <span className="mb-2 text-4xl">{stat.icon}</span>
      <span className="counter-number text-4xl font-bold text-white sm:text-5xl">
        {animate ? count.toLocaleString() : '0'}{stat.suffix}
      </span>
      <span className="mt-2 text-center text-sm font-medium uppercase tracking-wide text-white/60">
        {stat.label}
      </span>
    </div>
  );
}

export default function StatsCounter() {
  const [animate, setAnimate] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setAnimate(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="grain relative overflow-hidden bg-gradient-hero py-2">
      {/* Blobs */}
      <div className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-[#25D366]/10 blur-3xl" />
      <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-[#C9A227]/10 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="grid grid-cols-2 divide-x divide-white/10 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="border-b border-white/10 sm:border-b-0">
              <StatItem stat={s} animate={animate} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
