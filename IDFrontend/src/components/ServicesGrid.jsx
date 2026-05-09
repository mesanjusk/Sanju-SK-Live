import { useNavigate } from 'react-router-dom';

const SERVICES = [
  { emoji: '💍', title: 'Wedding Cards',      desc: 'Hindu, Muslim, Christian & all occasions',   color: 'from-rose-500/10 to-pink-500/5',   border: 'border-rose-200',    text: 'text-rose-600' },
  { emoji: '🏆', title: 'Trophy & Awards',     desc: 'Custom trophies, shields & certificates',    color: 'from-amber-500/10 to-yellow-500/5', border: 'border-amber-200',   text: 'text-amber-600' },
  { emoji: '💼', title: 'Corporate Gifts',     desc: 'Branded merchandise & premium hampers',      color: 'from-blue-500/10 to-indigo-500/5',  border: 'border-blue-200',    text: 'text-blue-600' },
  { emoji: '📇', title: 'Visiting Cards',      desc: 'Matte, gloss, spot UV & premium finishes',   color: 'from-[#25D366]/10 to-[#128C7E]/5',  border: 'border-[#25D366]/30', text: 'text-[#128C7E]' },
  { emoji: '🎁', title: 'Custom Gifts',        desc: 'Photo mugs, frames, cushions & more',        color: 'from-purple-500/10 to-violet-500/5', border: 'border-purple-200',  text: 'text-purple-600' },
  { emoji: '🖼️', title: 'Photo Printing',     desc: 'Canvas, acrylic, wallpaper & photo books',   color: 'from-teal-500/10 to-cyan-500/5',    border: 'border-teal-200',    text: 'text-teal-600' },
  { emoji: '📣', title: 'Flex & Banners',      desc: 'Outdoor banners, standees & hoardings',      color: 'from-orange-500/10 to-red-500/5',   border: 'border-orange-200',  text: 'text-orange-600' },
  { emoji: '✨', title: 'Your Imagination',    desc: 'Anything you dream, we bring to life',       color: 'from-[#C9A227]/15 to-[#E8C547]/5',  border: 'border-[#C9A227]/40', text: 'text-[#9A7A1A]' },
];

export default function ServicesGrid() {
  const navigate = useNavigate();

  return (
    <section className="bg-[#FAFAFA] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center">
          <span className="section-tag">What We Create</span>
          <h2 className="section-title mt-4">
            One Stop Solution for<br />
            <span className="text-green-gradient">Every Occasion</span>
          </h2>
          <div className="gold-divider" />
          <p className="section-subtitle mx-auto text-center">
            From wedding invitations to corporate branding — whatever you imagine,
            <strong className="text-gray-700"> we create it.</strong>
          </p>
        </div>

        {/* Grid */}
        <div className="mt-12 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {SERVICES.map((s) => (
            <button
              key={s.title}
              onClick={() => navigate('/products')}
              className={`group flex flex-col items-start rounded-3xl border bg-gradient-to-br p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-premium-lg ${s.color} ${s.border}`}
            >
              <span className="mb-3 text-3xl transition-transform duration-300 group-hover:scale-110">{s.emoji}</span>
              <h3 className={`font-serif text-base font-bold ${s.text}`}>{s.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500 line-clamp-2">{s.desc}</p>
              <span className={`mt-3 text-xs font-bold ${s.text} opacity-0 transition-opacity group-hover:opacity-100`}>
                Explore →
              </span>
            </button>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-sm font-medium text-gray-500">
            Don't see what you need?&nbsp;
            <a
              href={`https://wa.me/919999999999?text=${encodeURIComponent('Hi! I have a custom requirement:')}`}
              target="_blank" rel="noreferrer"
              className="font-bold text-[#128C7E] underline-offset-2 hover:underline"
            >
              Tell us on WhatsApp →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
