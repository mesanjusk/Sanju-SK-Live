import { useEffect, useMemo, useState } from 'react';
import { FaPhoneAlt, FaTimes } from 'react-icons/fa';
import seo from '../../config/local-seo.json';

const DISMISSED_KEY = 'sk_call_reminder_dismissed';
const FIRST_REMINDER_DELAY_MS = 15000;
const REPEAT_REMINDER_DELAY_MS = 8000;
const VISIBLE_FOR_MS = 4200;

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
    const remind = () => {
      if (document.visibilityState === 'visible') setVisible(true);
    };
    let repeatTimer;
    const firstTimer = window.setTimeout(() => {
      remind();
      repeatTimer = window.setInterval(remind, REPEAT_REMINDER_DELAY_MS);
    }, FIRST_REMINDER_DELAY_MS);
    const onVisibility = () => {
      if (document.visibilityState !== 'visible') setVisible(false);
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.clearTimeout(firstTimer);
      window.clearInterval(repeatTimer);
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
      className="fixed right-2 top-1/2 z-50 w-[178px] -translate-y-1/2 rounded-2xl border border-[#dfd2ef] bg-white/95 p-3 shadow-[0_12px_32px_rgba(24,62,42,.24)] backdrop-blur sm:right-5 sm:w-[210px]">
      <button type="button" onClick={dismiss} aria-label="Dismiss call reminders for this visit"
        className="absolute right-2 top-2 rounded-full p-1 text-[#87789a] focus-visible:outline-2 focus-visible:outline-emerald-700">
        <FaTimes aria-hidden="true" />
      </button>
      <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-[#efe5fa] text-[#785aa5]">
        <FaPhoneAlt aria-hidden="true" />
      </div>
      <p className="pr-3 text-[12px] font-extrabold leading-4 text-[#4e3768]">Need help choosing?</p>
      <p className="mt-1 text-[10px] leading-4 text-[#8a7a98]">Call our Gondia studio</p>
      <p className="mt-1 text-[10px] font-bold text-[#4e3768]">{displayNumber}</p>
      <a href={'tel:' + dialNumber} onClick={dismiss}
        className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-[#785aa5] px-2 py-2 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#785aa5]">
        <FaPhoneAlt aria-hidden="true" /> Call now
      </a>
    </aside>
  );
}
