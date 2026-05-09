import { FaStar, FaMapMarkerAlt, FaClock, FaWhatsapp, FaExternalLinkAlt } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';

const HOURS = [
  { day: 'Monday – Saturday', time: '9:00 AM – 9:00 PM', open: true },
  { day: 'Sunday',            time: '10:00 AM – 6:00 PM', open: true },
];

const MOCK_GOOGLE_REVIEWS = [
  { name: 'Amit K.',      rating: 5, text: 'Best printing shop! Quality is amazing and delivery is always on time.', time: '2 weeks ago' },
  { name: 'Meera S.',     rating: 5, text: 'Got wedding cards made here. Absolutely loved the quality. Very professional team.', time: '1 month ago' },
  { name: 'Rajan P.',     rating: 5, text: 'Trophy engraving was perfect. Will come again for all our corporate needs.', time: '3 weeks ago' },
];

export default function GMBSection({ config = {} }) {
  const waNum = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');
  const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent('Hi! I want to visit your shop. Can you share directions?')}`;
  const gmb = config.googleMapsUrl || 'https://maps.google.com';
  const placeId = config.googlePlaceId || '';

  return (
    <section className="bg-[#FAFAFA] py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <span className="section-tag">Find Us</span>
          <h2 className="section-title mt-4">Visit Our <span className="text-green-gradient">Store</span></h2>
          <div className="gold-divider" />
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-2">
          {/* Left: GMB info card */}
          <div className="space-y-5">
            {/* Rating badge */}
            <div className="card-premium p-6">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4285F4]">
                  <SiGoogle className="text-2xl text-white" />
                </div>
                <div>
                  <p className="font-bold text-gray-900">SANJU SK Digital – Mahi Creation</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_,i) => <FaStar key={i} className="text-[#C9A227] text-sm" />)}
                    </div>
                    <span className="text-sm font-bold text-gray-900">5.0</span>
                    <span className="text-xs text-gray-500">· Google Reviews</span>
                  </div>
                </div>
              </div>
              <a href={gmb} target="_blank" rel="noreferrer"
                className="mt-4 flex items-center gap-2 rounded-xl bg-[#4285F4]/10 px-4 py-2.5 text-sm font-semibold text-[#4285F4] hover:bg-[#4285F4]/20 transition-colors">
                <SiGoogle className="text-sm" /> See all reviews on Google
                <FaExternalLinkAlt className="ml-auto text-xs" />
              </a>
            </div>

            {/* Address + Hours */}
            <div className="card-premium divide-y divide-gray-100">
              <div className="flex items-start gap-3 p-5">
                <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[#25D366]" />
                <div>
                  <p className="font-semibold text-gray-800">Address</p>
                  <p className="mt-0.5 text-sm text-gray-600">
                    {config.address || 'Shop Address, City, State – PIN Code'}<br />
                    <a href={gmb} target="_blank" rel="noreferrer" className="text-[#128C7E] hover:underline text-xs font-medium">
                      Get directions →
                    </a>
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-5">
                <FaClock className="mt-0.5 shrink-0 text-[#25D366]" />
                <div>
                  <p className="font-semibold text-gray-800">Business Hours</p>
                  <div className="mt-1 space-y-1">
                    {HOURS.map((h) => (
                      <div key={h.day} className="flex items-center justify-between gap-4 text-sm">
                        <span className="text-gray-600">{h.day}</span>
                        <span className={`font-medium ${h.open ? 'text-[#128C7E]' : 'text-red-500'}`}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-5">
                <a href={waHref} target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-sm font-bold text-white hover:bg-[#128C7E] transition-colors">
                  <FaWhatsapp className="text-base" /> Chat Before Visiting
                </a>
              </div>
            </div>
          </div>

          {/* Right: Map embed + mini reviews */}
          <div className="space-y-5">
            {/* Google Maps iframe */}
            <div className="overflow-hidden rounded-3xl shadow-premium">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=${config.googleMapsApiKey || ''}&q=${encodeURIComponent(config.address || 'SANJU SK Digital Mahi Creation')}`}
                width="100%" height="280"
                style={{ border: 0 }}
                allowFullScreen loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Store Location"
                className="w-full"
                onError={(e) => {
                  e.target.src = `https://maps.google.com/maps?q=${encodeURIComponent(config.address || 'printing shop')}&output=embed`;
                }}
              />
            </div>

            {/* Mini Google reviews */}
            <div className="card-premium p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-bold text-gray-800">Google Reviews</h3>
                <a href={gmb} target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#4285F4] hover:underline">View all</a>
              </div>
              <div className="space-y-3">
                {MOCK_GOOGLE_REVIEWS.map((rv, i) => (
                  <div key={i} className="rounded-2xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#4285F4] text-xs font-bold text-white">{rv.name[0]}</div>
                        <span className="text-sm font-semibold text-gray-800">{rv.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{rv.time}</span>
                    </div>
                    <div className="mt-1.5 flex gap-0.5">
                      {[...Array(rv.rating)].map((_,j) => <FaStar key={j} className="text-[#C9A227] text-xs" />)}
                    </div>
                    <p className="mt-1 text-xs text-gray-600 line-clamp-2">{rv.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
