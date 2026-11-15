import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FaPhoneAlt } from 'react-icons/fa';
import seo from '../../config/local-seo.json';
import './pinterest-storefront.css';

const DISMISSED_KEY = 'sk_help_call_used';
const FIRST_SHOW_DELAY = 8000;

// One unobtrusive contact control: rounded "Need help?" label above a circular call icon.
export default function CallReminder({ phoneNumber = seo.phone }) {
  const { pathname } = useLocation();
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

  useEffect(() => {
    if (dismissed) return undefined;
    const timer = window.setTimeout(() => setVisible(true), FIRST_SHOW_DELAY);
    return () => window.clearTimeout(timer);
  }, [dismissed]);

  const onCall = () => {
    setVisible(false);
    setDismissed(true);
    try { sessionStorage.setItem(DISMISSED_KEY, '1'); } catch {}
  };

  // Never cover checkout or account administration with a floating contact CTA.
  if (!visible || dismissed || pathname.startsWith('/checkout') ||
    pathname.startsWith('/admin') || pathname.startsWith('/login')) return null;

  return (
    <aside className="sk-pin-help-bubble" aria-label="Quick phone assistance">
      <a className="sk-pin-help-link" href={'tel:' + dialNumber}
        onClick={onCall} aria-label={'Need help? Call SANJU SK Digital at ' + dialNumber}>
        <span className="sk-pin-help-label">Need help?</span>
        <span className="sk-pin-help-icon"><FaPhoneAlt aria-hidden="true" /></span>
      </a>
    </aside>
  );
}
