import seo from '../config/local-seo.json';

// Short, useful homepage introduction; no rankings or unsupported guarantees.
export default function LocalSeoIntro() {
  return (
    <section aria-labelledby="local-printing-heading" className="mx-auto max-w-2xl px-4 py-4">
      <div className="rounded-2xl border border-emerald-100 bg-white px-5 py-5 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Gondia • Nagpur • Balaghat</p>
        <h1 id="local-printing-heading" className="mt-2 text-xl font-extrabold leading-snug text-gray-900">
          Printing, 3D Signage & Wedding Cards in Gondia
        </h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          SANJU SK Digital – Mahi Creation offers custom print design, LED acrylic sign boards,
          wedding invitations, flex banners, trophies and corporate branding from Gondia, Maharashtra.
        </p>
        <a className="mt-4 inline-flex rounded-full bg-[#075E54] px-5 py-2.5 text-sm font-bold text-white"
          href={`https://wa.me/${seo.phone.replace(/\D/g, '')}?text=${encodeURIComponent('Hello, I would like a quotation for printing or signage.')}`}
          target="_blank" rel="noopener noreferrer">Request a quotation on WhatsApp</a>
        <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {seo.services.map((service) => (
            <div key={service.name} className="rounded-xl bg-gray-50 p-3">
              <h2 className="text-xs font-bold text-gray-900">{service.name}</h2>
              <p className="mt-1 text-xs leading-5 text-gray-600">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
