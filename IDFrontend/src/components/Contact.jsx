import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaWhatsapp, FaInstagram, FaEnvelope, FaArrowLeft, FaPhone, FaMapMarkerAlt, FaPaperPlane } from 'react-icons/fa';
import api from '../api';

export default function Contact() {
  const navigate = useNavigate();
  const [config, setConfig] = useState({});
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  useEffect(() => {
    api.get('/api/confi/GetConfiList')
      .then((res) => setConfig(res.data?.result?.[0] || {}))
      .catch(() => {});
  }, []);

  const wa = String(config.whatsappNumber || config.phone || '').replace(/\D/g, '');

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
    setForm({ name: '', email: '', message: '' });
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="min-h-screen bg-black text-white pb-24">
      {/* Instagram-style sticky header */}
      <div className="sticky top-0 z-40 flex items-center gap-3 border-b border-white/10 bg-black/80 px-4 py-3 backdrop-blur">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white active:scale-95"
        >
          <FaArrowLeft className="text-sm" />
        </button>
        <h1 className="flex-1 text-sm font-semibold">Contact Us</h1>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-6">
        {/* Profile-card style header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* Avatar ring — gradient like Instagram */}
          <div className="mb-4 rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 p-[3px]">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-black">
              {config.logo ? (
                <img src={config.logo} alt={config.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-orange-400 text-2xl font-bold">
                  {(config.name || 'SK').slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
          </div>
          <h2 className="text-lg font-bold">{config.name || 'SK Luxury Studio'}</h2>
          {config.address && (
            <p className="mt-1 flex items-center gap-1 text-xs text-white/50">
              <FaMapMarkerAlt className="text-pink-400" /> {config.address}
            </p>
          )}
          <p className="mt-2 max-w-xs text-xs leading-relaxed text-white/60">
            Premium invitations & print designs. DM us or use the form below — we reply fast!
          </p>

          {/* Stat pills */}
          <div className="mt-4 flex gap-6 text-center">
            {wa && (
              <a
                href={`https://wa.me/${wa}`}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition active:scale-95"
              >
                <FaWhatsapp className="text-xl text-[#25D366]" />
                <span className="text-[11px] text-white/60">WhatsApp</span>
              </a>
            )}
            {config.insta && (
              <a
                href={config.insta}
                target="_blank"
                rel="noreferrer"
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition active:scale-95"
              >
                <FaInstagram className="text-xl text-pink-400" />
                <span className="text-[11px] text-white/60">Instagram</span>
              </a>
            )}
            {config.email && (
              <a
                href={`mailto:${config.email}`}
                className="flex flex-col items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-5 py-3 transition active:scale-95"
              >
                <FaEnvelope className="text-xl text-orange-400" />
                <span className="text-[11px] text-white/60">Email</span>
              </a>
            )}
          </div>
        </div>

        {/* Quick contact info */}
        {(config.phone || config.whatsappNumber) && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <FaPhone className="shrink-0 text-[#25D366]" />
            <span className="text-sm text-white/80">{config.whatsappNumber || config.phone}</span>
          </div>
        )}

        {/* Message form */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/80">Send a Message</h3>

          {sent && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#25D366]/20 px-4 py-3 text-sm text-[#25D366]">
              <FaPaperPlane /> Message sent! We'll reply shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              placeholder="Email address"
              className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
            <textarea
              required
              rows={4}
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Your message…"
              className="w-full resize-none rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder-white/30 outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500"
            />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-pink-500 via-orange-400 to-yellow-400 py-3 text-sm font-bold text-white shadow-lg active:scale-95"
            >
              <FaPaperPlane /> Send Message
            </button>
          </form>
        </div>

        {/* WhatsApp CTA */}
        {wa && (
          <a
            href={`https://wa.me/${wa}?text=${encodeURIComponent('Hi! I have a query about your designs.')}`}
            target="_blank"
            rel="noreferrer"
            className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-[#25D366]/40 bg-[#25D366]/10 py-4 text-sm font-semibold text-[#25D366] active:scale-95"
          >
            <FaWhatsapp className="text-lg" /> Chat on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
