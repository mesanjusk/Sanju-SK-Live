const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://idbackend-rf1u.onrender.com';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || 'https://idfrontend.vercel.app')
  .split(',')
  .map((origin) => origin.trim());

export default async function handler(req, res) {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/ping`);
    const data = await response.text();
    res.status(200).send(`Pinged backend: ${data}`);
  } catch (error) {
    console.error('Ping failed:', error);
    res.status(500).send('Ping failed');
  }
}
