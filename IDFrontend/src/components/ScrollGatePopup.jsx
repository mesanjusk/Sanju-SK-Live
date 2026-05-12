import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaWhatsapp, FaLock, FaUnlock } from 'react-icons/fa';

const TOKEN_KEY = 'sk_access_token';
const UNLOCKED_KEY = 'sk_access_unlocked';

// Generates a short unique browser token
function genToken() {
  return 'sk_' + Math.random().toString(36).slice(2, 9) + Date.now().toString(36);
}

// Call this on app mount: checks URL param and localStorage
export function checkAndApplyAccessToken() {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('access');
    if (urlToken) {
      // Accept any token from URL — grants this browser full access
      localStorage.setItem(TOKEN_KEY, urlToken);
      localStorage.setItem(UNLOCKED_KEY, 'true');
      // Strip from URL bar without reload
      const url = new URL(window.location.href);
      url.searchParams.delete('access');
      window.history.replaceState({}, '', url.toString());
      return true;
    }
    return localStorage.getItem(UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export function isAccessUnlocked() {
  try {
    // Check URL token first
    const params = new URLSearchParams(window.location.search);
    if (params.get('access')) return checkAndApplyAccessToken();
    return localStorage.getItem(UNLOCKED_KEY) === 'true';
  } catch {
    return false;
  }
}

export default function ScrollGatePopup({ visible, waNumber, onUnlock }) {
  const tokenRef = useRef(null);

  useEffect(() => {
    // Prepare token as soon as popup is about to show
    if (visible) {
      let token = localStorage.getItem(TOKEN_KEY);
      if (!token) {
        token = genToken();
        localStorage.setItem(TOKEN_KEY, token);
      }
      tokenRef.current = token;
    }
  }, [visible]);

  const handleWAClick = () => {
    const token = tokenRef.current || genToken();
    const siteUrl = window.location.origin;
    const accessLink = `${siteUrl}?access=${token}`;
    const wa = String(waNumber || '').replace(/\D/g, '');

    const msg =
      `Hi! I'm interested in viewing your full collection 🎨\n\n` +
      `Please send me the full access link:\n${accessLink}`;

    // Grant access immediately for this browser
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(UNLOCKED_KEY, 'true');

    if (wa) {
      window.open(`https://wa.me/${wa}?text=${encodeURIComponent(msg)}`, '_blank', 'noreferrer');
    }
    onUnlock?.();
  };

  const handleSkip = () => {
    // Grant access without WhatsApp (allow user to dismiss)
    const token = tokenRef.current || genToken();
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(UNLOCKED_KEY, 'true');
    onUnlock?.();
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            key="sheet"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 mx-auto max-w-md rounded-t-3xl bg-white px-6 pt-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* Drag handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-gray-200" />

            {/* Lock icon */}
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 via-orange-400 to-yellow-400 shadow-lg">
                <FaLock className="text-2xl text-white" />
              </div>
            </div>

            <h2 className="mb-1 text-center text-xl font-bold text-gray-900">
              You're loving our designs!
            </h2>
            <p className="mb-5 text-center text-sm leading-relaxed text-gray-500">
              You've browsed <strong>10 designs</strong>. Tap below to unlock the
              full collection instantly via WhatsApp — we'll send you a private access link.
            </p>

            {/* WhatsApp unlock button */}
            <button
              onClick={handleWAClick}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-[#25D366] py-4 text-base font-bold text-white shadow-lg active:scale-95"
            >
              <FaWhatsapp className="text-xl" />
              I'm Interested — Unlock Full Access
            </button>

            {/* Skip / already have access */}
            <button
              onClick={handleSkip}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-2xl border border-gray-200 py-3 text-sm font-medium text-gray-500 active:scale-95"
            >
              <FaUnlock className="text-xs" /> Continue Browsing
            </button>

            <p className="mt-3 text-center text-[11px] text-gray-400">
              Your access link works on this device only.
              If you share it, the recipient gets their own experience.
            </p>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
