import seo from '../config/local-seo.json';

// Native details/summary works with keyboard, screen readers and without JS.
export default function FAQSection() {
  return (
    <section id="faq" aria-labelledby="gondia-faq-heading" className="mx-auto my-3 w-full max-w-2xl px-1 sm:px-3">
      <div className="rounded-xl border border-[#e6dbef] bg-[#fffbff] p-3 shadow-sm sm:p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-violet-700">Local printing questions</p>
        <h2 id="gondia-faq-heading" className="mt-1 text-base font-bold text-[#4c3563]">Printing & signage FAQs in Gondia</h2>
        <div className="mt-2 divide-y divide-[#e7dbf1]">
          {seo.faqs.map((faq) => (
            <details className="group py-2.5" key={faq.question}>
              <summary className="cursor-pointer list-none pr-5 text-[13px] font-semibold leading-5 text-[#4d3665] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">
                {faq.question}
                <span aria-hidden="true" className="float-right text-violet-700 group-open:rotate-45">+</span>
              </summary>
              <p className="pt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
