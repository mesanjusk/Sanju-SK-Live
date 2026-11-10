import { useEffect, useMemo, useState } from 'react';
import { FaPhoneAlt, FaTimes } from 'react-icons/fa';
import seo from '../../config/local-seo.json';
import './pinterest-storefront.css';

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
    <aside role="status" aria-label="Call SANJU SK Digital" className="sk-pin-call-reminder">
      <button type="button" className="sk-pin-call-dismiss" onClick={dismiss}
        aria-label="Dismiss call reminders for this visit">
        <FaTimes aria-hidden="true" />
      </button>
      <div className="sk-pin-call-brand">
        <img src="/images/sk-digital-final.svg" alt="" width="42" height="30" />
        <span>SANJU SK Digital</span>
      </div>
      <p className="sk-pin-call-heading">Need help choosing a design?</p>
      <p className="sk-pin-call-subtitle">Speak to our Gondia studio</p>
      <a href={'tel:' + dialNumber} className="sk-pin-call-cta" onClick={dismiss}>
        <FaPhoneAlt aria-hidden="true" /> Call {displayNumber}
      </a>
    </aside>
  );
}
