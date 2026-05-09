import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebookF, FaInstagram, FaYoutube, FaWhatsapp, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope } from 'react-icons/fa';
import api from '../api';

export default function Footer() {
  const [config, setConfig] = useState({ name: '', email: '', phone: '', whatsappNumber: '', address: '', fb: '', insta: '', youtube: '', linkedIn: '', twitter: '' });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/api/confi/GetConfiList'),
      api.get('/api/categories'),
    ]).then(([confiRes, catRes]) => {
      if (confiRes.data?.success && confiRes.data.result.length > 0) {
        setConfig(confiRes.data.result[0]);
      }
      setCategories((Array.isArray(catRes.data) ? catRes.data : catRes.data?.result || []).slice(0, 6));
    }).catch(() => {});
  }, []);

  const year = useMemo(() => new Date().getFullYear(), []);
  const waNumber = String(config.whatsappNumber || config.phone || '919999999999').replace(/\D/g, '');
  const waHref = `https://wa.me/${waNumber}?text=${encodeURIComponent('Hi! I need help with an order.')}`;

  const socials = [
    { Icon: FaFacebookF, href: config.fb, label: 'Facebook' },
    { Icon: FaInstagram, href: config.insta, label: 'Instagram' },
    { Icon: FaYoutube, href: config.youtube, label: 'YouTube' },
    { Icon: FaLinkedinIn, href: config.linkedIn, label: 'LinkedIn' },
    { Icon: FaWhatsapp, href: waHref, label: 'WhatsApp' },
  ].filter((s) => s.href);

  return (
    <footer className="bg-[#075E54] text-white">
      {/* Main footer */}
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-xl font-bold text-white">{config.name || 'SK Cards'}</h3>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Professional printing &amp; advertising services — wedding cards, visiting cards, banners, and more.
            </p>
            {socials.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {socials.map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-[#25D366] hover:scale-110"
                  >
                    <Icon className="text-sm" />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">Quick Links</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              {[
                { label: 'Home', to: '/' },
                { label: 'All Products', to: '/products' },
                { label: 'Categories', to: '/allCategories' },
                { label: 'Favourites', to: '/favorites' },
                { label: 'Contact Us', to: '/contact' },
              ].map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-[#25D366] transition-colors">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">Categories</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-white/80">
              {categories.length > 0
                ? categories.map((cat) => (
                    <li key={cat._id}>
                      <Link to={`/subcategory/${cat.category_uuid || cat._id}`} className="hover:text-[#25D366] transition-colors">
                        {cat.name}
                      </Link>
                    </li>
                  ))
                : ['Wedding Cards', 'Visiting Cards', 'Flex Banners', 'Brochures'].map((n) => (
                    <li key={n}><Link to="/products" className="hover:text-[#25D366] transition-colors">{n}</Link></li>
                  ))
              }
            </ul>
          </div>

          {/* Contact */}
          <address className="not-italic">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white/60">Contact</h4>
            <ul className="mt-4 space-y-3 text-sm text-white/80">
              {config.address && (
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="mt-0.5 shrink-0 text-[#25D366]" />
                  <span>{config.address}</span>
                </li>
              )}
              {config.phone && (
                <li className="flex items-center gap-2">
                  <FaPhone className="shrink-0 text-[#25D366]" />
                  <a href={`tel:${config.phone}`} className="hover:text-[#25D366] transition-colors">{config.phone}</a>
                </li>
              )}
              {config.email && (
                <li className="flex items-center gap-2">
                  <FaEnvelope className="shrink-0 text-[#25D366]" />
                  <a href={`mailto:${config.email}`} className="hover:text-[#25D366] transition-colors">{config.email}</a>
                </li>
              )}
              <li>
                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-semibold text-white hover:bg-[#128C7E] transition-colors"
                >
                  <FaWhatsapp />
                  Chat on WhatsApp
                </a>
              </li>
            </ul>
          </address>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10 bg-[#054d44]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-4 text-center text-xs text-white/50 sm:flex-row sm:px-6">
          <span>© {year} {config.name || 'SK Cards'}. All rights reserved.</span>
          <span>Designed with ❤️ for beautiful printing</span>
          <Link to="/login" className="text-white/30 hover:text-white/60 transition-colors">Admin</Link>
        </div>
      </div>
    </footer>
  );
}
