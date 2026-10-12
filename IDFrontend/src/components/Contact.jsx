import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaWhatsapp, FaInstagram, FaPhone, FaMapMarkerAlt, FaPaperPlane, FaEnvelope } from 'react-icons/fa';
import MobileBottomNav from './mobile/MobileBottomNav';
import localSeo from '../config/local-seo.json';

const WA = '919372333633';
export default function Contact() {
  const [form, setForm] = useState({ name: '', service: 'Wedding cards & invitations', message: '' });
  const mapUrl = localSeo.mapUrl;
  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const request = `Hello SANJU SK Digital – Mahi Creation,\nMy name: ${form.name}\nService: ${form.service}\nRequirement: ${form.message}\nPlease share a quotation.`;
  const enquiryUrl = `https://wa.me/${WA}?text=${encodeURIComponent(request)}`;

  const handleSubmit = (event) => {
    event.preventDefault();
    // Open the user's WhatsApp composer. Never show a fake "message sent" state.
    window.location.href = enquiryUrl;
  };

  return (
    <div className="sk-storefront min-h-screen pb-32">
      <header className="sk-detail-back">
        <Link to="/" className="sk-glass-button !h-9 !w-9" aria-label="Back to home"><FaArrowLeft /></Link>
        <div><h1 className="font-extrabold tracking-tight text-[#294238]">Let's create something remarkable</h1><p className="text-[10px] text-[#789080]">SANJU SK Digital · Mahi Creation</p></div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">
        <section className="sk-catalog-hero">
          <span>MADE PERSONAL, MADE TO LAST</span>
          <h2 className="max-w-md !text-3xl">Your vision.<br />Our craft.</h2>
          <p>Premium printing, dimensional signage, invitations and keepsakes, all from Gondia. Tell us what you imagine.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`https://wa.me/${WA}`} target="_blank" rel="noopener noreferrer" className="sk-order-button !bg-[#f0d1a0] !text-[#1a372b]">
              <FaWhatsapp /> Chat on WhatsApp
            </a>
            <a href="tel:+919372333633" className="inline-flex items-center gap-2 rounded-xl border border-[#e9e3d155] px-4 py-3 text-xs font-bold text-white"><FaPhone /> Call the studio</a>
          </div>
        </section>
        <div className="grid gap-5 lg:grid-cols-2">
          <section className="sk-detail-panel" aria-labelledby="enquire-heading">
            <span className="sk-brand-subline">PERSONAL QUOTATION</span>
            <h2 id="enquire-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#263e32]">Start your project</h2>
            <p className="mt-2 text-sm leading-6 text-[#708174]">Share a few details. We'll open WhatsApp with your message ready for review and sending.</p>
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div><label htmlFor="sk-contact-name" className="mb-1 block text-xs font-bold text-[#314e3c]">Your name</label>
                <input id="sk-contact-name" className="lux-input !bg-white" value={form.name} required
                  onChange={e => onChange('name',e.target.value)} placeholder="Your name" /></div>
              <div><label htmlFor="sk-contact-service" className="mb-1 block text-xs font-bold text-[#314e3c]">Service</label>
                <select id="sk-contact-service" className="lux-input !bg-white" value={form.service} onChange={e => onChange('service',e.target.value)}>
                  <option>Wedding cards & invitations</option>
                  <option>3D LED & acrylic signage</option>
                  <option>Flex banners & standees</option>
                  <option>Trophies & corporate gifts</option>
                  <option>Visiting cards, labels & branding</option>
                  <option>Other custom printing</option>
                </select></div>
              <div><label htmlFor="sk-contact-details" className="mb-1 block text-xs font-bold text-[#314e3c]">Project details</label>
                <textarea id="sk-contact-details" className="lux-input min-h-[112px] !bg-white" required
                  value={form.message} onChange={e => onChange('message',e.target.value)}
                  placeholder="What do you need, quantity, size and deadline?" /></div>
              <button type="submit" className="sk-order-button !w-full !py-4 !text-sm"><FaPaperPlane /> Continue to WhatsApp</button>
            </form>
          </section>
          <section className="sk-detail-panel" aria-labelledby="visit-heading">
            <span className="sk-brand-subline">VISIT OUR STUDIO</span>
            <h2 id="visit-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#263e32]">Find us in Gondia</h2>
            <address className="mt-4 not-italic text-sm leading-7 text-[#586e5e]">
              <strong className="text-[#2e4c37]">{localSeo.businessName}</strong><br />
              {localSeo.address.streetAddress}<br />
              Gondia, Maharashtra 441601
            </address>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#f2f5ed] p-4"><p className="sk-brand-subline">OPEN HOURS</p><p className="mt-2 text-sm font-bold text-[#304e3d]">Mon–Sat</p><p className="text-xs text-[#65746a]">10 AM – 8 PM</p></div>
              <div className="rounded-xl bg-[#f2f5ed] p-4"><p className="sk-brand-subline">SUNDAY</p><p className="mt-2 text-sm font-bold text-[#304e3d]">Closed</p><p className="text-xs text-[#65746a]">Send us a message</p></div>
            </div>
            <div className="mt-6 flex flex-col gap-3 text-sm font-bold text-[#365b45]">
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><FaMapMarkerAlt className="text-[#c3975d]" /> Google Maps directions →</a>
              <a href="tel:+919372333633" className="flex items-center gap-3"><FaPhone className="text-[#c3975d]" /> +91 93723 33633</a>
              <a href="mailto:skgondia@gmail.com" className="flex items-center gap-3"><FaEnvelope className="text-[#c3975d]" /> skgondia@gmail.com</a>
              <a href={localSeo.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3"><FaInstagram className="text-[#c3975d]" /> Visit our Instagram studio →</a>
            </div>
          </section>
        </div>
      </main>
      <MobileBottomNav />
    </div>
  );
}
