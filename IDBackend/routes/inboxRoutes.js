import express from 'express';
import axios from 'axios';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import Confi from '../models/Confi.js';

const router = express.Router();

const getWAConfig = async () => {
  const confi = await Confi.findOne().sort({ createdAt: -1 }).lean();
  return {
    accessToken:   confi?.metaAccessToken   || process.env.WHATSAPP_ACCESS_TOKEN || '',
    phoneNumberId: confi?.metaPhoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    apiVersion:    process.env.WHATSAPP_API_VERSION || 'v19.0',
  };
};

// GET /api/inbox — list conversations sorted by last message
router.get('/', async (req, res) => {
  try {
    const conversations = await Conversation.find()
      .sort({ lastAt: -1 })
      .limit(100);
    res.json({ success: true, result: conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/inbox/:phone/messages — get messages for a conversation
router.get('/:phone/messages', async (req, res) => {
  try {
    const { phone } = req.params;
    // Mark as read
    await Conversation.findOneAndUpdate({ phone }, { unreadCount: 0 });
    const messages = await Message.find({ conversationPhone: phone })
      .sort({ createdAt: 1 })
      .limit(200);
    res.json({ success: true, result: messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/inbox/:phone/send — send a message to a contact
router.post('/:phone/send', async (req, res) => {
  const { phone } = req.params;
  const { body } = req.body;
  if (!body?.trim()) return res.status(400).json({ success: false, message: 'Message body required' });

  try {
    const cfg = await getWAConfig();
    if (!cfg.accessToken || !cfg.phoneNumberId) {
      return res.status(400).json({ success: false, message: 'WhatsApp API not configured' });
    }

    const url = `https://graph.facebook.com/${cfg.apiVersion}/${cfg.phoneNumberId}/messages`;
    const { data } = await axios.post(url, {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: phone.replace(/\D/g, ''),
      type: 'text',
      text: { preview_url: false, body },
    }, {
      headers: { Authorization: `Bearer ${cfg.accessToken}`, 'Content-Type': 'application/json' },
      timeout: 15000,
    });

    const metaMessageId = data?.messages?.[0]?.id || '';

    // Save outbound message to DB
    const msg = await Message.create({
      conversationPhone: phone,
      from: cfg.phoneNumberId,
      to: phone,
      body,
      direction: 'outbound',
      metaMessageId,
    });

    // Update conversation
    await Conversation.findOneAndUpdate(
      { phone },
      { lastMessage: body, lastAt: new Date() },
      { upsert: true, new: true }
    );

    res.json({ success: true, result: msg });
  } catch (err) {
    console.error('[inbox] send error:', err?.response?.data || err.message);
    res.status(500).json({ success: false, message: err?.response?.data?.error?.message || err.message });
  }
});

// DELETE /api/inbox/:phone — delete a conversation and its messages
router.delete('/:phone', async (req, res) => {
  try {
    await Promise.all([
      Conversation.findOneAndDelete({ phone: req.params.phone }),
      Message.deleteMany({ conversationPhone: req.params.phone }),
    ]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
