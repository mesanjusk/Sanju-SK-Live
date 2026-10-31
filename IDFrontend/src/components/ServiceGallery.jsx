import { FaArrowRight, FaWhatsapp } from 'react-icons/fa';

const SERVICES = [
  {
    title: 'Designer Wedding Cards & Laser-Cut Invitations',
    description: 'Traditional, modern and premium wedding invitations with laser-cut details, personalized wording and finishing options.',
    url: '/wedding-card-printing-gondia/',
    image: '/images/services/wedding-cards.svg',
    alt: 'Designer Wedding Cards in Gondia - SANJU SK Digital'
  },
  {
    title: '3D LED Channel Letters & Acrylic Sign Boards',
    description: 'Distinctive illuminated channel letters, acrylic signs and branded storefront signage made to your size and design brief.',
    url: '/3d-led-sign-boards-gondia/',
    image: '/images/services/led-signage.svg',
    alt: '3D LED Channel Letters and Acrylic Sign Boards in Gondia - SANJU SK Digital'
  },
  {
    title: 'Customized Trophies, Mementos & Corporate Awards',
    description: 'Personalized trophies, engraved awards and premium mementos for schools, events, recognition ceremonies and businesses.',
    url: '/custom-trophies-awards-gondia/',
    image: '/images/services/trophies.svg',
    alt: 'Customized Trophies and Corporate Awards in Gondia - SANJU SK Digital'
  },
  {
    title: 'Large Format Flex Banners, Standees & Vinyl Graphics',
    description: 'High-impact flex banners, vinyl prints, event backdrops and promotional standees in custom dimensions.',
    url: '/flex-banner-printing-gondia/',
    image: '/images/services/flex-banners.svg',
    alt: 'Flex Banners Standees and Vinyl Graphics in Gondia - SANJU SK Digital'
  }
];

export default function ServiceGallery() {
  return (
    <section aria-labelledby="sk-core-services" className="mx-auto w-full max-w-6xl px-4 pb-7 pt-7 sm:px-6">
      <div className="mb-5 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[.24em] text-[#ad8950]">Designed and made in Gondia</p>
        <h2 id="sk-core-services" className="mt-2 text-2xl font-extrabold tracking-tight text-[#17495a] sm:text-3xl">Our Signature Services</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#60747a]">Explore custom printing, signage, awards and wedding invitations for Gondia, Nagpur and Balaghat.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:gap-5">
        {SERVICES.map((service) => (
          <article key={service.url} className="group overflow-hidden rounded-[23px] border border-[#e6e8df] bg-[#fffdf8] shadow-[0_12px_36px_-25px_rgba(12,53,64,.45)]">
            <a href={service.url} className="block overflow-hidden bg-gradient-to-br from-[#f3ede0] to-[#e5eeea]" aria-label={'Read about ' + service.title}>
              <img src={service.image} alt={service.alt} loading="lazy" decoding="async"
                width="800" height="520" className="h-44 w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] sm:h-48" />
            </a>
            <div className="p-4 sm:p-5">
              <h3 className="min-h-[48px] text-[16px] font-extrabold leading-snug text-[#183f4b]">{service.title}</h3>
              <p className="mt-2 min-h-[60px] text-[13px] leading-5 text-[#63737a]">{service.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={service.url}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#07566a] px-3 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#064658] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#07566a]">
                  View Details <FaArrowRight aria-hidden="true" />
                </a>
                <a href={'https://wa.me/919372333633?text=' + encodeURIComponent('Hi Sanju SK Digital, I am inquiring about ' + service.title)}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={'Enquire on WhatsApp about ' + service.title}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#9fd8b7] bg-[#e8f8ef] px-3 py-2.5 text-xs font-bold text-[#16633c] transition-colors hover:bg-[#d4f3e1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1e9d5e]">
                  <FaWhatsapp aria-hidden="true" /> WhatsApp
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
