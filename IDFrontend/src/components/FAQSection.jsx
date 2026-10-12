import seo from '../config/local-seo.json';

// Native details/summary works with keyboard, screen readers and without JS.
export default function FAQSection() {
  return (
    <section id="faq" aria-labelledby="gondia-faq-heading" className="mx-auto my-8 w-full max-w-2xl px-4">
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-700">Local printing questions</p>
        <h2 id="gondia-faq-heading" className="mt-2 text-xl font-bold text-gray-900">Printing & signage FAQs in Gondia</h2>
        <div className="mt-4 divide-y divide-gray-200">
          {seo.faqs.map((faq) => (
            <details className="group py-3" key={faq.question}>
              <summary className="cursor-pointer list-none pr-5 text-sm font-semibold leading-6 text-gray-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-600">
                {faq.question}
                <span aria-hidden="true" className="float-right text-emerald-700 group-open:rotate-45">+</span>
              </summary>
              <p className="pt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
