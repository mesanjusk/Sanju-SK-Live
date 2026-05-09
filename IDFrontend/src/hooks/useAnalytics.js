import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api';

const getDevice = () => {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  return 'desktop';
};

const getOrCreateVisitorId = () => {
  const key = 'sk_vid';
  let id = localStorage.getItem(key);
  if (!id) {
    id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    localStorage.setItem(key, id);
    return { id, isNew: true };
  }
  return { id, isNew: false };
};

export function useAnalytics() {
  const location = useLocation();
  const prevPath = useRef(null);

  useEffect(() => {
    if (location.pathname === prevPath.current) return;
    prevPath.current = location.pathname;
    const { id: visitorId, isNew } = getOrCreateVisitorId();
    api.post('/api/analytics/track', {
      visitorId,
      isNew,
      path: location.pathname,
      referrer: document.referrer || '',
      userAgent: navigator.userAgent,
      device: getDevice(),
      event: 'pageview',
    }).catch(() => {});
  }, [location.pathname]);
}

export function trackWhatsAppClick(productId = '') {
  const { id: visitorId } = getOrCreateVisitorId();
  api.post('/api/analytics/track', {
    visitorId, isNew: false,
    path: window.location.pathname,
    device: getDevice(),
    event: 'whatsapp_click',
    meta: { productId },
  }).catch(() => {});
}
