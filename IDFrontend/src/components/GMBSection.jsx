import { FaStar, FaMapMarkerAlt, FaClock, FaWhatsapp, FaExternalLinkAlt } from 'react-icons/fa';
import { SiGoogle } from 'react-icons/si';

const HOURS = [
  { day: 'Monday – Saturday', time: '10:00 AM – 8:00 PM', open: true },
  { day: 'Sunday',            time: 'Closed', open: false },
];



export default function GMBSection({ config = {} }) {
  const waNum = String('919372333633').replace(/\D/g, '');
  const waHref = `https://wa.me/${waNum}?text=${encodeURIComponent('Hi! I want to visit your shop. Can you share directions?')}`;
  const gmb = 'https://maps.google.com/maps?cid=9198516368001650236';
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
                  <p className="mt-1 text-sm text-gray-600">Printing, signage and wedding invitations in Gondia</p>
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
                    {'Krishnapura Ward, in front of Santoshi Mata Mandir, Gondia, Maharashtra 441601'}<br />
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

          </div>
      </div>
    </section>
  );
}
