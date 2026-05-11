import express from 'express';
import axios from 'axios';
import Confi from '../models/Confi.js';
import Listing from '../models/Listing.js';
import Lead from '../models/Lead.js';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import { resolveAutoReply } from '../middleware/autoReply.js';

const router = express.Router();

const getWAConfig = async () => {
  const confi = await Confi.findOne().sort({ createdAt: -1 }).lean();
  return {
    accessToken:   confi?.metaAccessToken   || process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: confi?.metaPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    webhookToken:  confi?.metaWebhookToken  || process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN || '',
    apiVersion:    process.env.WHATSAPP_API_VERSION || 'v19.0',
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

// Save inbound message to Conversation + Message collections
const saveInboundMessage = async (from, body, contactName, metaMessageId) => {
  try {
    await Conversation.findOneAndUpdate(
      { phone: from },
      { name: contactName || '', lastMessage: body, lastAt: new Date(), $inc: { unreadCount: 1 } },
      { upsert: true }
    );
    await Message.create({
      conversationPhone: from,
      from,
      to: 'business',
      body,
      direction: 'inbound',
      metaMessageId: metaMessageId || '',
    });
  } catch (err) {
    console.error('[webhook] save message error:', err.message);
  }
};

// Save outbound (auto-reply) to Message collection
const saveOutboundMessage = async (to, body, phoneNumberId, metaMessageId) => {
  try {
    await Message.create({
      conversationPhone: to,
      from: phoneNumberId,
      to,
      body,
      direction: 'outbound',
      metaMessageId: metaMessageId || '',
    });
    await Conversation.findOneAndUpdate(
      { phone: to },
      { lastMessage: body, lastAt: new Date() },
      { upsert: true }
    );
  } catch (err) {
    console.error('[webhook] save outbound error:', err.message);
  }
};

// Extract product name from incoming message text (bold *ProductName* or "interested in X")
const extractProductFromMessage = (text) => {
  if (!text) return null;
  const patterns = [
    /interested in[:\s*]+([^*\n]+)/i,
    /enquiry[:\s*]+([^*\n]+)/i,
    /about[:\s*]+\*([^*]+)\*/i,
    /\*([^*]+)\*/,
  ];
  for (const p of patterns) {
    const m = text.match(p);
    if (m) return m[1].trim();
  }
  return null;
};

// Auto-save lead when a customer messages
const autoSaveLead = async (from, text, contactName) => {
  try {
    const existing = await Lead.findOne({ phone: from }).sort({ createdAt: -1 });
    if (existing && (Date.now() - new Date(existing.createdAt).getTime()) < 60 * 60 * 1000) return;

    const productName = extractProductFromMessage(text);
    let productId = null;
    if (productName) {
      const product = await Listing.findOne({ title: { $regex: productName, $options: 'i' } });
      if (product) productId = product._id;
    }

    await Lead.create({
      phone: from,
      name: contactName || '',
      productId,
      productName: productName || '',
      message: text,
      source: 'whatsapp',
      status: 'new',
    });
  } catch (err) {
    console.error('[webhook] lead save error:', err.message);
  }
};

// Build product-specific auto-reply
const buildProductReply = async (text) => {
  const productName = extractProductFromMessage(text);
  if (!productName) return null;
  const product = await Listing.findOne({ title: { $regex: productName, $options: 'i' } });
  if (!product) return null;
  return (
    `Thank you for your enquiry! 🙏\n\n` +
    `*${product.title}*\n` +
    (product.description ? `${product.description}\n\n` : '\n') +
    `💰 Price: ₹${product.price}${product.quantityPricing?.length ? ' (bulk discounts available)' : ''}\n` +
    (product.size ? `📐 Size: ${product.size}\n` : '') +
    `\nOur team will get back to you shortly with more details!`
  );
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

// POST: receive incoming messages — save to inbox, capture lead, auto-reply
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

    const contacts = value?.contacts || [];

    for (const msg of messages) {
      const from = msg.from;
      const contact = contacts.find((c) => c.wa_id === from);
      const contactName = contact?.profile?.name || '';
      const metaMessageId = msg.id || '';

      const text = msg.type === 'text'
        ? msg.text?.body
        : msg.type === 'button'
        ? msg.button?.text
        : null;

      if (!text) continue;

      // 1. Save inbound message to inbox
      await saveInboundMessage(from, text, contactName, metaMessageId);

      // 2. Auto-save lead (deduped per hour)
      await autoSaveLead(from, text, contactName);

      // 3. Try product-specific auto-reply first
      const productReply = await buildProductReply(text);
      if (productReply) {
        const delay = 2000;
        await new Promise((r) => setTimeout(r, delay));
        const result = await sendMetaText({
          to: from, body: productReply,
          accessToken: cfg.accessToken,
          phoneNumberId: cfg.phoneNumberId,
          apiVersion: cfg.apiVersion,
        }).catch((e) => { console.error('[webhook] product reply error:', e?.response?.data || e.message); return null; });

        if (result) {
          const outMsgId = result.data?.messages?.[0]?.id || '';
          await saveOutboundMessage(from, productReply, cfg.phoneNumberId, outMsgId);
        }
        continue;
      }

      // 4. Fall back to keyword auto-reply rules
      const rule = await resolveAutoReply(text);
      if (!rule) continue;

      const delay = Math.max(0, Number(rule.delaySeconds ?? 2)) * 1000;
      if (delay > 0) await new Promise((r) => setTimeout(r, delay));

      const result = await sendMetaText({
        to: from, body: rule.reply,
        accessToken: cfg.accessToken,
        phoneNumberId: cfg.phoneNumberId,
        apiVersion: cfg.apiVersion,
      }).catch((e) => { console.error('[webhook] send error:', e?.response?.data || e.message); return null; });

      if (result) {
        const outMsgId = result.data?.messages?.[0]?.id || '';
        await saveOutboundMessage(from, rule.reply, cfg.phoneNumberId, outMsgId);
      }
    }
  } catch (err) {
    console.error('[webhook] processing error:', err.message);
  }
});

export default router;
