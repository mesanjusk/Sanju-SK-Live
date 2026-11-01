import { useEffect, useMemo, useState } from 'react';
import { FaPhoneAlt, FaTimes } from 'react-icons/fa';
import seo from '../../config/local-seo.json';

const DISMISSED_KEY = 'sk_call_reminder_dismissed';
const REMINDER_INTERVAL_MS = 15000;
const VISIBLE_FOR_MS = 7000;

export default function CallReminder({ phoneNumber = seo.phone }) {
  const [dismissed, setDismissed] = useState(() => {
    try { return sessionStorage.getItem(DISMISSED_KEY) === '1'; }
    catch { return false; }
  });
  const [visible, setVisible] = useState(false);
  const dialNumber = useMemo(() => {
    const digits = String(phoneNumber || seo.phone).replace(/\D/g, '');
    return digits.length === 10 ? '+91' + digits :
      digits.startsWith('91') && digits.length === 12 ? '+' + digits : seo.phone;
  }, [phoneNumber]);
  const displayNumber = dialNumber === seo.phone ? seo.displayPhone : dialNumber;

  useEffect(() => {
    if (dismissed) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setVisible(true);
    }, REMINDER_INTERVAL_MS);
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') setVisible(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [dismissed]);

  useEffect(() => {
    if (!visible) return undefined;
    const timeout = window.setTimeout(() => setVisible(false), VISIBLE_FOR_MS);
    return () => window.clearTimeout(timeout);
  }, [visible]);

  const dismiss = () => {
    setVisible(false);
    setDismissed(true);
    try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch { /* Private browsing */ }
  };

  if (!visible || dismissed) return null;
  return (
    <aside role="status" aria-label="Call SANJU SK Digital"
      className="fixed bottom-24 left-3 right-3 z-50 mx-auto max-w-sm rounded-2xl border border-[#c8dfcf] bg-white p-3 shadow-[0_12px_38px_rgba(24,62,42,.2)] md:bottom-6 md:left-auto md:right-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f5e9] text-[#176a43]"><FaPhoneAlt aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-extrabold text-[#254b36]">Need help choosing?</p>
          <p className="text-[11px] text-[#617c6a]">Call our Gondia studio · {displayNumber}</p>
        </div>
        <a href={'tel:' + dialNumber} onClick={dismiss}
          className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-[#176a43] px-3 py-2 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176a43]">
          <FaPhoneAlt aria-hidden="true" /> Call
        </a>
        <button type="button" onClick={dismiss} aria-label="Dismiss call reminders for this visit"
          className="shrink-0 rounded-full p-1 text-[#60736a] focus-visible:outline-2 focus-visible:outline-emerald-700">
          <FaTimes aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
