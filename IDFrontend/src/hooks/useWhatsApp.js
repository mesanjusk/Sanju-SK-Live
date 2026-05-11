import { useEffect, useState } from 'react';
import api from '../api';

let cachedNumber = null;
let cachedCategories = null;

export function useWhatsAppNumber() {
  const [waNumber, setWaNumber] = useState(cachedNumber || '');

  useEffect(() => {
    if (cachedNumber) { setWaNumber(cachedNumber); return; }
    api.get('/api/confi/effective-wa-number')
      .then((res) => {
        if (res.data?.phone) {
          cachedNumber = res.data.phone;
          setWaNumber(res.data.phone);
        }
      })
      .catch(() => {});
  }, []);

  return waNumber;
}

// Resolves a category UUID/id to a human-readable name
export async function resolveCategoryName(categoryId) {
  if (!categoryId) return '';
  try {
    if (!cachedCategories) {
      const res = await api.get('/api/categories');
      cachedCategories = res.data || [];
    }
    const cat = cachedCategories.find(
      (c) => c.category_uuid === categoryId || c._id === categoryId
    );
    return cat?.name || '';
  } catch {
    return '';
  }
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
