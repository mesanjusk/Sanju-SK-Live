import seo from '../config/local-seo.json';

// HTML microdata NAP exactly matches the primary Google Business Profile details.
export default function LocalContactFooter() {
  const addr = seo.address;
  return (
    <footer className="mx-auto mb-8 w-full max-w-2xl px-4 text-gray-700">
      <div itemScope itemType="https://schema.org/LocalBusiness"
        className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-bold text-gray-900" itemProp="name">{seo.businessName}</h2>
        <p className="mt-2 text-sm leading-6" itemProp="address" itemScope itemType="https://schema.org/PostalAddress">
          <span itemProp="streetAddress">{addr.streetAddress}</span>,{' '}
          <span itemProp="addressLocality">{addr.addressLocality}</span>,{' '}
          <span itemProp="addressRegion">{addr.addressRegion}</span>{' '}
          <span itemProp="postalCode">{addr.postalCode}</span>,{' '}
          <meta itemProp="addressCountry" content="IN" />India
        </p>
        <p className="mt-1 text-sm">Phone: <a className="font-semibold underline" href={`tel:${seo.phone}`} itemProp="telephone">{seo.displayPhone}</a></p>
        <p className="mt-1 text-sm">Hours: <time itemProp="openingHours" dateTime="Mo-Sa 10:00-20:00">Mon–Sat, 10:00 AM–8:00 PM</time> · Sunday closed</p>
        <nav aria-label="Business contact links" className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-bold text-emerald-700">
          <a href={seo.mapUrl} target="_blank" rel="noopener noreferrer" itemProp="hasMap">Get directions</a>
          <a href={seo.instagramUrl} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={seo.siteUrl + '/contact'}>Contact us</a>
        </nav>
      </div>
    </footer>
  );
}
