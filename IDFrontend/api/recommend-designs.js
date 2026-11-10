// Optional server-side Gemini ranking. Never expose GEMINI_API_KEY to the browser.
const MAX_BODY = 24000;
const ttl = 4 * 60 * 1000;
const cache = new Map();
const rate = new Map();
const clean = (value, length = 150) => String(value || '').replace(/[<>]/g, ' ').slice(0, length);
export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ids: [], mode: 'unavailable' });
  }
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(200).json({ ids: [], mode: 'fallback' });
  const bytes = Number(req.headers['content-length'] || 0);
  if (bytes > MAX_BODY) return res.status(413).json({ ids: [], mode: 'fallback' });
  const origin = req.headers.origin;
  if (origin && !/^https:\/\/(?:www\.)?sanjusk\.in$/.test(origin) &&
    !/^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) &&
    !/^http:\/\/localhost:\d+$/.test(origin)) {
    return res.status(403).json({ ids: [], mode: 'fallback' });
  }
  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const candidates = (Array.isArray(body.candidates) ? body.candidates : []).slice(0, 100)
    .map(item => ({
      id: clean(item?.id, 100), title: clean(item?.title, 100),
      category: clean(item?.category, 80), description: clean(item?.description, 130),
    })).filter(item => item.id);
  const interests = (Array.isArray(body.interests) ? body.interests : []).slice(0, 4)
    .map(item => ({ id: clean(item?.id, 100), title: clean(item?.title, 100),
      category: clean(item?.category, 80), keywords: clean(item?.keywords, 150) }));
  if (!candidates.length || !interests.length) return res.status(200).json({ ids: [], mode: 'fallback' });
  const distinct = new Set(candidates.map(p => p.id));
  const key = JSON.stringify({ c: [...distinct], i: interests });
  const now = Date.now();
  const found = cache.get(key);
  if (found && found.expires > now) return res.status(200).json({ ids: found.ids, mode: 'gemini' });
  const remote = String(req.headers['x-forwarded-for'] || '').split(',')[0] || 'unknown';
  const history = rate.get(remote) || [];
  const recent = history.filter(t => now - t < 60000);
  if (recent.length >= 4) return res.status(429).json({ ids: [], mode: 'fallback' });
  rate.set(remote, [...recent, now]);
  if (cache.size > 180) cache.clear();
  if (rate.size > 200) rate.clear();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const model = /^gemini-[a-z0-9.-]+$/.test(process.env.GEMINI_MODEL || '') ?
      process.env.GEMINI_MODEL : 'gemini-3.5-flash-lite';
    const response = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent', {
        method: 'POST', signal: controller.signal,
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
        body: JSON.stringify({
          contents: [{
            role: 'user', parts: [{
              text: 'You are an expert visual merchandising assistant for an Indian custom-printing studio. ' +
                'Rank the best related, visually/thematically similar catalogue designs for this anonymous recent ' +
                'viewing preference. Keep a balanced mix of exploration. ONLY return IDs from provided candidates. ' +
                'Do not invent catalog products, prices or categories. ' +
                JSON.stringify({ recentDesignInterests: interests, candidateDesigns: candidates }),
            }],
          }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT', properties: {
                ids: { type: 'ARRAY', items: { type: 'STRING' } },
              }, required: ['ids'],
            },
            temperature: 0.3, maxOutputTokens: 650,
          },
        }),
      }
    );
    if (!response.ok) return res.status(200).json({ ids: [], mode: 'fallback' });
    const output = await response.json();
    const raw = output?.candidates?.[0]?.content?.parts?.map(p => p.text).join('') || '{}';
    const result = JSON.parse(raw);
    const ids = [...new Set((Array.isArray(result.ids) ? result.ids : [])
      .map(String).filter(id => distinct.has(id)))].slice(0, 35);
    cache.set(key, { ids, expires: now + ttl });
    return res.status(200).json({ ids, mode: 'gemini' });
  } catch {
    return res.status(200).json({ ids: [], mode: 'fallback' });
  } finally { clearTimeout(timer); }
}
