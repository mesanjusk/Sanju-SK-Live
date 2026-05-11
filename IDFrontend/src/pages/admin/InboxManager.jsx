import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box, Typography, TextField, IconButton, Avatar, Badge, Divider,
  CircularProgress, Chip, InputAdornment, Tooltip, Paper,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import api from '../../api';

const formatTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  if (diff < 60000) return 'now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m`;
  if (diff < 86400000) return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

const formatMessageTime = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
};

const getInitials = (name, phone) => {
  if (name) return name.charAt(0).toUpperCase();
  return phone ? phone.slice(-2) : '?';
};

export default function InboxManager() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);
  const pollRef = useRef(null);

  const fetchConversations = useCallback(async () => {
    try {
      const r = await api.get('/api/inbox');
      setConversations(r.data?.result || []);
    } catch {}
  }, []);

  const fetchMessages = useCallback(async (phone) => {
    if (!phone) return;
    setLoadingMsgs(true);
    try {
      const r = await api.get(`/api/inbox/${phone}/messages`);
      setMessages(r.data?.result || []);
      // Mark unread as read in local state
      setConversations((prev) =>
        prev.map((c) => c.phone === phone ? { ...c, unreadCount: 0 } : c)
      );
    } catch {}
    finally { setLoadingMsgs(false); }
  }, []);

  // Initial load
  useEffect(() => { fetchConversations(); }, [fetchConversations]);

  // Poll conversations every 8 seconds
  useEffect(() => {
    pollRef.current = setInterval(fetchConversations, 8000);
    return () => clearInterval(pollRef.current);
  }, [fetchConversations]);

  // Poll messages when a conversation is open
  useEffect(() => {
    if (!selected) return;
    const id = setInterval(() => fetchMessages(selected.phone), 5000);
    return () => clearInterval(id);
  }, [selected, fetchMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const openConversation = async (conv) => {
    setSelected(conv);
    setMessages([]);
    await fetchMessages(conv.phone);
  };

  const sendMessage = async () => {
    if (!draft.trim() || !selected || sending) return;
    setSending(true);
    const body = draft.trim();
    setDraft('');
    try {
      await api.post(`/api/inbox/${selected.phone}/send`, { body });
      await fetchMessages(selected.phone);
      await fetchConversations();
    } catch (err) {
      const errMsg = err?.response?.data?.message || 'Send failed';
      setMessages((prev) => [...prev, {
        _id: `err-${Date.now()}`,
        body: `⚠️ Failed to send: ${errMsg}`,
        direction: 'outbound',
        createdAt: new Date(),
      }]);
    } finally { setSending(false); }
  };

  const deleteConversation = async (phone, e) => {
    e.stopPropagation();
    try {
      await api.delete(`/api/inbox/${phone}`);
      setConversations((prev) => prev.filter((c) => c.phone !== phone));
      if (selected?.phone === phone) { setSelected(null); setMessages([]); }
    } catch {}
  };

  const filtered = conversations.filter((c) =>
    !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.phone?.includes(search)
  );

  return (
    <Box sx={{ display: 'flex', height: 'calc(100vh - 140px)', minHeight: 500, borderRadius: 3, overflow: 'hidden', border: '1px solid', borderColor: 'divider', bgcolor: 'white' }}>

      {/* ─── Left panel: conversation list ─── */}
      <Box sx={{ width: { xs: selected ? 0 : '100%', md: 300 }, flexShrink: 0, display: { xs: selected ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', borderRight: '1px solid', borderColor: 'divider' }}>
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: '#075E54', color: 'white' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
            <WhatsAppIcon />
            <Typography variant="subtitle1" fontWeight={700}>WhatsApp Inbox</Typography>
          </Box>
          <TextField
            size="small" placeholder="Search contacts…" value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'white', fontSize: 18 }} /></InputAdornment>,
              sx: { bgcolor: 'rgba(255,255,255,0.15)', borderRadius: 2, color: 'white', '& input': { color: 'white', '&::placeholder': { color: 'rgba(255,255,255,0.6)' } } },
            }}
            sx={{ '& .MuiOutlinedInput-notchedOutline': { border: 'none' } }}
          />
        </Box>

        {/* Conversation list */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          {filtered.length === 0 && (
            <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
              <WhatsAppIcon sx={{ fontSize: 40, opacity: 0.3, mb: 1 }} />
              <Typography variant="body2">No conversations yet</Typography>
              <Typography variant="caption">Customers who message your WhatsApp will appear here</Typography>
            </Box>
          )}
          {filtered.map((conv) => (
            <Box key={conv.phone}>
              <Box
                onClick={() => openConversation(conv)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, cursor: 'pointer',
                  bgcolor: selected?.phone === conv.phone ? '#f0f9f0' : 'transparent',
                  '&:hover': { bgcolor: '#f5f5f5' },
                }}
              >
                <Badge badgeContent={conv.unreadCount || 0} color="success" max={99}>
                  <Avatar sx={{ bgcolor: '#25D366', width: 44, height: 44, fontSize: 16 }}>
                    {getInitials(conv.name, conv.phone)}
                  </Avatar>
                </Badge>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                      {conv.name || conv.phone}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">{formatTime(conv.lastAt)}</Typography>
                  </Box>
                  {conv.name && (
                    <Typography variant="caption" color="text.secondary" display="block">{conv.phone}</Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {conv.lastMessage}
                  </Typography>
                </Box>
                <Tooltip title="Delete conversation">
                  <IconButton size="small" sx={{ opacity: 0, '.MuiBox-root:hover > &': { opacity: 1 } }}
                    onClick={(e) => deleteConversation(conv.phone, e)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider />
            </Box>
          ))}
        </Box>
      </Box>

      {/* ─── Right panel: chat window ─── */}
      {!selected ? (
        <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0f9f0', color: 'text.secondary' }}>
          <WhatsAppIcon sx={{ fontSize: 80, color: '#25D366', opacity: 0.5, mb: 2 }} />
          <Typography variant="h6" color="text.secondary">Select a conversation</Typography>
          <Typography variant="body2" color="text.secondary">or wait for customers to message you</Typography>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Chat header */}
          <Box sx={{ px: 2, py: 1.5, bgcolor: '#075E54', color: 'white', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {/* Back button on mobile */}
            <Box sx={{ display: { md: 'none' } }}>
              <IconButton size="small" sx={{ color: 'white' }} onClick={() => setSelected(null)}>←</IconButton>
            </Box>
            <Avatar sx={{ bgcolor: '#25D366', width: 38, height: 38 }}>
              {getInitials(selected.name, selected.phone)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontWeight={700}>{selected.name || selected.phone}</Typography>
              {selected.name && <Typography variant="caption" sx={{ opacity: 0.8 }}>{selected.phone}</Typography>}
            </Box>
            <Box sx={{ flex: 1 }} />
            <Chip
              label="via Meta API"
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.2)', color: 'white', fontSize: 10 }}
            />
          </Box>

          {/* Messages */}
          <Box
            sx={{
              flex: 1, overflow: 'auto', p: 2,
              bgcolor: '#ECE5DD',
              backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23c5b9a8\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
            }}
          >
            {loadingMsgs && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}><CircularProgress size={24} /></Box>
            )}
            {!loadingMsgs && messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Paper sx={{ display: 'inline-block', px: 3, py: 1.5, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.8)' }}>
                  <Typography variant="caption" color="text.secondary">No messages yet. Send one to start the conversation.</Typography>
                </Paper>
              </Box>
            )}
            {messages.map((msg, i) => {
              const isOut = msg.direction === 'outbound';
              return (
                <Box key={msg._id || i} sx={{ display: 'flex', justifyContent: isOut ? 'flex-end' : 'flex-start', mb: 1 }}>
                  <Box
                    sx={{
                      maxWidth: '75%',
                      bgcolor: isOut ? '#DCF8C6' : 'white',
                      borderRadius: isOut ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      px: 1.5, py: 1,
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {msg.body}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.25, fontSize: 10 }}>
                      {formatMessageTime(msg.createdAt)}
                      {isOut && ' ✓✓'}
                    </Typography>
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>

          {/* Message input */}
          <Box sx={{ p: 1.5, bgcolor: '#F0F0F0', display: 'flex', gap: 1, alignItems: 'flex-end' }}>
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder="Type a message…"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
              }}
              sx={{ bgcolor: 'white', borderRadius: 3, '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
            />
            <IconButton
              onClick={sendMessage}
              disabled={!draft.trim() || sending}
              sx={{ bgcolor: '#25D366', color: 'white', '&:hover': { bgcolor: '#128C7E' }, '&:disabled': { bgcolor: '#ccc' } }}
            >
              {sending ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
            </IconButton>
          </Box>
        </Box>
      )}
    </Box>
  );
}
