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
    title: 'Custom Trophies, Mementos & Corporate Awards',
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
    <section aria-labelledby="sk-core-services" className="mx-auto w-full max-w-6xl px-3 pb-5 pt-5 sm:px-6 sm:pt-8">
      <div className="mb-3 text-center">
        <p className="text-[11px] font-extrabold uppercase tracking-[.24em] text-[#a78955]">Designed and made in Gondia</p>
        <h2 id="sk-core-services" className="mt-1 text-xl font-extrabold tracking-tight text-[#244f3b] sm:text-3xl">Our Signature Services</h2>
        <p className="mx-auto mt-1 max-w-xl text-xs leading-5 text-[#718175] sm:text-sm">Explore custom printing, signage, awards and wedding invitations for Gondia, Nagpur and Balaghat.</p>
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:gap-5">
        {SERVICES.map((service) => (
          <article key={service.url} className="group flex flex-col overflow-hidden rounded-2xl border border-[#e3e7dc] bg-[#fffefa] shadow-[0_8px_28px_-23px_rgba(25,65,45,.4)]">
            <a href={service.url} className="block overflow-hidden bg-gradient-to-br from-[#f6edda] to-[#e9f0e6]" aria-label={'Read about ' + service.title}>
              <img src={service.image} alt={service.alt} loading="lazy" decoding="async"
                width="800" height="520" className="h-28 w-full object-cover transition-transform duration-300 group-hover:scale-[1.025] sm:h-48" />
            </a>
            <div className="flex flex-1 flex-col p-2.5 sm:p-5">
              <h3 className="min-h-[42px] text-[12px] font-extrabold leading-snug text-[#254638] line-clamp-3 sm:min-h-[48px] sm:text-[16px]">{service.title}</h3>
              <p className="mt-1 min-h-[45px] text-[10px] leading-4 text-[#6d8071] line-clamp-3 sm:mt-2 sm:min-h-[60px] sm:text-[13px] sm:leading-5">{service.description}</p>
              <div className="mt-auto flex flex-wrap gap-1.5 pt-3 sm:gap-2">
                <a href={service.url}
                  className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-[#245941] px-1 py-2 text-[10px] font-bold text-white transition-colors hover:bg-[#194b35] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#245941] sm:px-3 sm:py-2.5 sm:text-xs">
                  View Details <FaArrowRight aria-hidden="true" />
                </a>
                <a href={'https://wa.me/919372333633?text=' + encodeURIComponent('Hi Sanju SK Digital, I am inquiring about ' + service.title)}
                  target="_blank" rel="noopener noreferrer"
                  aria-label={'Enquire on WhatsApp about ' + service.title}
                  className="inline-flex min-w-0 flex-1 items-center justify-center gap-1 rounded-lg border border-[#b4d4bb] bg-[#edf6eb] px-1 py-2 text-[10px] font-bold text-[#246243] transition-colors hover:bg-[#e0efdf] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#246243] sm:px-3 sm:py-2.5 sm:text-xs">
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
