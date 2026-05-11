import express from 'express';
import axios from 'axios';
import Confi from '../models/Confi.js';
import { resolveAutoReply } from '../middleware/autoReply.js';

const router = express.Router();

const getWAConfig = async () => {
  const confi = await Confi.findOne().sort({ createdAt: -1 }).lean();
  return {
    provider:        confi?.whatsappProvider || process.env.WA_PROVIDER || 'official',
    accessToken:     confi?.metaAccessToken  || process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId:   confi?.metaPhoneNumberId|| process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    webhookToken:    confi?.metaWebhookToken || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
    apiVersion:      process.env.WHATSAPP_API_VERSION || 'v19.0',
  };
};

const sendMetaText = async ({ to, body, accessToken, phoneNumberId, apiVersion }) => {
  const url = `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`;
  return axios.post(url, {
    messaging_product: 'whatsapp',
    recipient_type: 'individual',
    to: String(to).replace(/\D/g, ''),
    type: 'text',
    text: { preview_url: false, body },
  }, {
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    timeout: 15000,
  });
};

// GET: webhook verification
router.get('/', async (req, res) => {
  try {
    const cfg = await getWAConfig();
    const mode      = req.query['hub.mode'];
    const token     = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];
    if (mode === 'subscribe' && token === cfg.webhookToken) {
      return res.status(200).send(challenge);
    }
    res.sendStatus(403);
  } catch {
    res.sendStatus(500);
  }
});

// POST: receive incoming messages and auto-reply
router.post('/', async (req, res) => {
  res.sendStatus(200); // Always ack immediately

  try {
    const entry = req.body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;
    if (!Array.isArray(messages) || !messages.length) return;

    const cfg = await getWAConfig();
    if (!cfg.accessToken || !cfg.phoneNumberId) return;

    for (const msg of messages) {
      const from = msg.from;
      const text = msg.type === 'text'
        ? msg.text?.body
        : msg.type === 'button'
        ? msg.button?.text
        : null;
      if (!text) continue;

      const rule = await resolveAutoReply(text);
      if (!rule) continue;

      const delay = Math.max(0, Number(rule.delaySeconds ?? 2)) * 1000;
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));

      await sendMetaText({
        to: from,
        body: rule.reply,
        accessToken: cfg.accessToken,
        phoneNumberId: cfg.phoneNumberId,
        apiVersion: cfg.apiVersion,
      }).catch((e) => console.error('[webhook] send error:', e?.response?.data || e.message));
    }
  } catch (err) {
    console.error('[webhook] processing error:', err.message);
  }
});

export default router;
