import { useState, useEffect } from 'react';
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const MOCK = [
  { name:'Priya Sharma',  initial:'P', occasion:'Wedding Cards',   rating:5, text:"Absolutely beautiful wedding cards! Quality far beyond expectations. Everyone was asking where we got them. Fast delivery and perfect printing.", color:'bg-rose-500' },
  { name:'Rahul Agarwal', initial:'R', occasion:'Corporate Gifts', rating:5, text:"Ordered branded merchandise for our company event. Premium quality and spot-on customization. Our team loved it. Will order again!", color:'bg-blue-500' },
  { name:'Sunita Patel',  initial:'S', occasion:'Trophy & Awards', rating:5, text:"Custom trophies for our annual awards — stunning, delivered on time, crisp engraving. Highly recommend!", color:'bg-amber-500' },
  { name:'Vikram Joshi',  initial:'V', occasion:'Visiting Cards',  rating:5, text:"Premium matte visiting cards with spot UV logo. They make a great impression — clients always compliment them!", color:'bg-[#128C7E]' },
  { name:'Anjali Mehta',  initial:'A', occasion:'Custom Gifts',    rating:5, text:"Custom photo book and canvas for my husband's birthday. Vibrant colors, amazing quality. Perfect gift!", color:'bg-purple-500' },
  { name:'Deepak Kumar',  initial:'D', occasion:'Flex Banners',    rating:5, text:"Professional flex banners for our shop opening — clear printing, vivid colors, durable. Very happy!", color:'bg-orange-500' },
];

export default function Testimonials({ reviews = [] }) {
  const all = reviews.length > 0 ? reviews : MOCK;
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);

  const go = (dir) => {
    setFade(false);
    setTimeout(() => { setIdx((p) => (p + dir + all.length) % all.length); setFade(true); }, 220);
  };

  useEffect(() => { const t = setInterval(() => go(1), 5000); return () => clearInterval(t); }, [all.length]);

  const r = all[idx];

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="section-tag">Happy Clients</span>
          <h2 className="section-title mt-4">What Our Clients <span className="text-green-gradient">Say</span></h2>
          <div className="gold-divider" />
        </div>

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="card-premium px-8 py-10 text-center sm:px-12 sm:py-14"
            style={{ opacity: fade ? 1 : 0, transform: fade ? 'none' : 'translateY(8px)', transition:'all .22s ease' }}>
            <FaQuoteLeft className="mx-auto mb-5 text-3xl text-[#25D366]/25" />
            <div className="mb-5 flex justify-center gap-1">
              {[...Array(5)].map((_,i) => <FaStar key={i} className={i < r.rating ? 'text-[#C9A227]' : 'text-gray-200'} />)}
            </div>
            <p className="text-base italic leading-relaxed text-gray-600 sm:text-lg">"{r.text}"</p>
            <div className="mt-8 flex flex-col items-center gap-2">
              <div className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white shadow-lg ${r.color}`}>{r.initial}</div>
              <p className="font-bold text-gray-900">{r.name}</p>
              <p className="text-xs font-semibold text-[#128C7E]">{r.occasion}</p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-4">
            <button onClick={() => go(-1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#25D366] hover:text-[#25D366] transition-colors"><FaChevronLeft className="text-xs" /></button>
            <div className="flex gap-2">
              {all.map((_,i) => <button key={i} onClick={() => setIdx(i)} className={`rounded-full transition-all duration-300 ${i===idx ? 'w-6 h-2 bg-[#25D366]' : 'w-2 h-2 bg-gray-200'}`} />)}
            </div>
            <button onClick={() => go(1)} className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 hover:border-[#25D366] hover:text-[#25D366] transition-colors"><FaChevronRight className="text-xs" /></button>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-3 gap-3 sm:grid-cols-6">
          {all.map((rv, i) => (
            <button key={i} onClick={() => setIdx(i)}
              className={`flex flex-col items-center rounded-2xl p-3 transition-all ${i===idx ? 'bg-[#25D366]/10 ring-2 ring-[#25D366]/30' : 'bg-gray-50 hover:bg-gray-100'}`}>
              <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white ${rv.color}`}>{rv.initial}</div>
              <p className="mt-1.5 line-clamp-1 text-center text-xs font-medium text-gray-700">{rv.name.split(' ')[0]}</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
