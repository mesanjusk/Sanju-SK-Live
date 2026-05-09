import { FaAward, FaClock, FaHeadset, FaPrint, FaTruck, FaCheckCircle } from 'react-icons/fa';

const FEATURES = [
  { Icon: FaPrint,       title: 'Premium Quality',       desc: 'Sharp prints, vibrant colors, and premium finishes that make your brand stand out.',        bg: 'bg-[#25D366]/10',  icon: 'text-[#128C7E]' },
  { Icon: FaClock,       title: 'Fast Turnaround',       desc: 'Same-day and express printing available. We deliver when you need it most.',                bg: 'bg-amber-50',       icon: 'text-amber-600' },
  { Icon: FaHeadset,     title: 'WhatsApp Support',      desc: 'Direct WhatsApp communication — get quotes, proofs and updates instantly.',                 bg: 'bg-blue-50',        icon: 'text-blue-600' },
  { Icon: FaTruck,       title: 'Pan-India Delivery',    desc: 'Fast courier delivery across India. Local same-day delivery also available.',               bg: 'bg-rose-50',        icon: 'text-rose-600' },
  { Icon: FaAward,       title: '10+ Years Experience',  desc: 'Trusted by 5000+ clients — from individuals to large corporates across all industries.',    bg: 'bg-purple-50',      icon: 'text-purple-600' },
  { Icon: FaCheckCircle, title: '100% Satisfaction',     desc: 'We don\'t stop until you\'re happy. Free reprints if quality doesn\'t meet our standard.', bg: 'bg-[#C9A227]/10',   icon: 'text-[#9A7A1A]' },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left text */}
          <div>
            <span className="section-tag">Why Choose Us</span>
            <h2 className="section-title mt-4">
              Your Trusted Printing<br />
              <span className="text-gold-gradient">Partner Since 2014</span>
            </h2>
            <div className="gold-divider mb-0 ml-0" />
            <p className="mt-5 text-base leading-relaxed text-gray-500">
              At SANJU SK Digital – Mahi Creation, we combine premium quality with
              affordable pricing and personal service. Every order is handled with care,
              from design to delivery.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a href="https://wa.me/919999999999?text=Hi! I want to place an order."
                target="_blank" rel="noreferrer"
                className="btn-wa text-sm">
                Order on WhatsApp
              </a>
              <a href="/products" className="btn-ghost text-sm">Browse Catalogue</a>
            </div>
          </div>

          {/* Right features grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <div key={f.title} className="card-premium group flex items-start gap-4 p-5">
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${f.bg} transition-transform duration-300 group-hover:scale-110`}>
                  <f.Icon className={`text-xl ${f.icon}`} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{f.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
