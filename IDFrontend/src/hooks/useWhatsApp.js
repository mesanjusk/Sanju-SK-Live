import { useEffect, useState } from 'react';
import api from '../api';

let cachedNumber = null;

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
