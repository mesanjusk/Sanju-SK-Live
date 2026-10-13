import { useEffect, useState } from 'react';
import api from '../api';

let cachedNumber = null;
let cachedCategories = null;
let pendingNumber = null;
let pendingCategories = null;

export function useWhatsAppNumber() {
  const [waNumber, setWaNumber] = useState(cachedNumber || '919372333633');
  useEffect(() => {
    let active = true;
    if (cachedNumber) { setWaNumber(cachedNumber); return; }
    // All catalog cards share a single pending request instead of one request per card.
    if (!pendingNumber) {
      pendingNumber = api.get('/api/confi/effective-wa-number', { timeout: 10000 })
        .then(res => {
          const n = res.data?.phone;
          if (n) cachedNumber = n;
          return cachedNumber || '919372333633';
        })
        .catch(() => cachedNumber || '919372333633')
        .finally(() => { pendingNumber = null; });
    }
    pendingNumber.then(n => { if (active) setWaNumber(n); });
    return () => { active = false; };
  }, []);
  return waNumber;
}

// Resolve a category UUID/id to a human-readable name with in-flight deduplication.
export async function resolveCategoryName(categoryId) {
  if (!categoryId) return '';
  if (!cachedCategories) {
    if (!pendingCategories) {
      pendingCategories = api.get('/api/categories', { timeout: 10000 })
        .then(res => {
          const rows = Array.isArray(res.data) ? res.data : res.data?.result;
          if (Array.isArray(rows)) cachedCategories = rows;
          return cachedCategories || [];
        })
        .catch(() => [])
        .finally(() => { pendingCategories = null; });
    }
    await pendingCategories;
  }
  const list = cachedCategories || [];
  const cat = list.find(c => c.category_uuid === categoryId || c._id === categoryId);
  return cat?.name || '';
}

// Call this when customer clicks WhatsApp button on a product — saves a lead
export async function saveEnquiryLead({ phone = '', productId = '', productName = '', message = '' }) {
  try {
    await api.post('/api/leads', {
      source: 'web',
      status: 'new',
      productId: productId || undefined,
      productName,
      message,
      phone,
    });
  } catch {
    // Non-critical: don't block the WA link from opening
  }
}
