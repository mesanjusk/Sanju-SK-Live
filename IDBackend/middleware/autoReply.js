import AutoReply from '../models/AutoReply.js';

const normalize = (text) => String(text || '').trim().toLowerCase();

export function matchRule(incomingText, rules = []) {
  const t = normalize(incomingText);
  if (!t) return null;
  for (const rule of rules) {
    if (!rule.isActive) continue;
    const kw = normalize(rule.keyword);
    if (!kw) continue;
    switch (String(rule.matchType || 'contains')) {
      case 'exact':       if (t === kw)            return rule; break;
      case 'starts_with': if (t.startsWith(kw))    return rule; break;
      default:            if (t.includes(kw))       return rule; break;
    }
  }
  return null;
}

export async function resolveAutoReply(incomingText) {
  const rules = await AutoReply.find({ isActive: true }).sort({ createdAt: 1 }).lean();
  return matchRule(incomingText, rules);
}
