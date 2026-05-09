import { useState } from 'react';
import { FaPlus, FaMinus } from 'react-icons/fa';

const FAQS = [
  { q: 'How do I place an order?', a: 'Simply browse our products, select what you need, and click "Order on WhatsApp". You\'ll be connected directly with us to confirm your design, quantity and delivery details.' },
  { q: 'What is the minimum order quantity?', a: 'Minimum quantities vary by product. Visiting cards start from 100 pcs, wedding cards from 50 pcs, banners from 1 pc, and trophies from 1 piece. Contact us on WhatsApp for exact details.' },
  { q: 'How long does printing take?', a: 'Standard orders are ready in 2–3 business days. Urgent/same-day orders are available for select products — please chat with us on WhatsApp to confirm availability.' },
  { q: 'Do you deliver to other cities?', a: 'Yes! We deliver pan-India via trusted courier partners. Delivery charges depend on weight, quantity and location. Local delivery in the city is often free for bulk orders.' },
  { q: 'Can I get a custom design made?', a: 'Absolutely! Our in-house design team can create custom designs for any product. Share your idea, logo or reference on WhatsApp and we\'ll send you a digital proof before printing.' },
  { q: 'What file formats do you accept for printing?', a: 'We accept PDF, AI, CDR, PSD, PNG and JPG files. For best print quality, we recommend high-resolution files (300 DPI) in CMYK colour mode.' },
  { q: 'Do you offer bulk discounts?', a: 'Yes! We offer attractive bulk discounts. The more you order, the lower the per-unit cost. Check our quantity pricing tiers on each product or ask us on WhatsApp for a custom quote.' },
  { q: 'What payment methods do you accept?', a: 'We accept UPI, bank transfer, cash on delivery (local only) and online payment links. All payments are confirmed before we begin printing.' },
];

export default function FAQSection() {
  const [open, setOpen] = useState(null);

  return (
    <section className="bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <span className="section-tag">FAQ</span>
          <h2 className="section-title mt-4">Frequently Asked <span className="text-green-gradient">Questions</span></h2>
          <div className="gold-divider" />
          <p className="section-subtitle mx-auto text-center text-sm">Everything you need to know about ordering from us.</p>
        </div>

        <div className="mt-10 space-y-3">
          {FAQS.map((faq, i) => (
            <div key={i} className={`overflow-hidden rounded-2xl border transition-all duration-300 ${open === i ? 'border-[#25D366]/40 bg-[#25D366]/4 shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300'}`}>
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-4 text-left"
              >
                <span className={`text-sm font-semibold leading-snug sm:text-base ${open === i ? 'text-[#128C7E]' : 'text-gray-800'}`}>
                  {faq.q}
                </span>
                <span className={`ml-4 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors ${open === i ? 'bg-[#25D366] text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {open === i ? <FaMinus className="text-[10px]" /> : <FaPlus className="text-[10px]" />}
                </span>
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? 'max-h-60' : 'max-h-0'}`}>
                <p className="px-6 pb-5 text-sm leading-relaxed text-gray-600">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-3xl bg-gradient-to-r from-[#075E54] to-[#128C7E] p-8 text-center text-white">
          <p className="font-serif text-lg font-bold">Still have questions?</p>
          <p className="mt-1 text-sm text-white/75">Chat with us directly on WhatsApp — we respond within minutes.</p>
          <a href="https://wa.me/919999999999?text=Hi! I have a question." target="_blank" rel="noreferrer"
            className="mt-5 inline-flex items-center gap-2 rounded-2xl bg-[#25D366] px-6 py-2.5 text-sm font-bold text-white shadow-wa hover:bg-white hover:text-[#128C7E] transition-all">
            Ask on WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}
