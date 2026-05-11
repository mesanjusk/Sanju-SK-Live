import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, CircularProgress,
  Divider, ToggleButtonGroup, ToggleButton, Avatar, InputAdornment,
  Accordion, AccordionSummary, AccordionDetails, Alert,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../api';
import { Toast } from '../../components/admin/AdminUiKit';

const MAX_MB = 1;
const FIELDS = [
  { key: 'name',           label: 'Business Name',    required: true },
  { key: 'email',          label: 'Email' },
  { key: 'phone',          label: 'Phone' },
  { key: 'whatsappNumber', label: 'WhatsApp Number (with country code, e.g. 919876543210)' },
  { key: 'address',        label: 'Address' },
  { key: 'fb',             label: 'Facebook URL' },
  { key: 'insta',          label: 'Instagram URL' },
  { key: 'twitter',        label: 'Twitter URL' },
  { key: 'linkedIn',       label: 'LinkedIn URL' },
  { key: 'youtube',        label: 'YouTube URL' },
];

const empty = Object.fromEntries([...FIELDS.map((f) => [f.key, '']),
  ['whatsappProvider', 'official'], ['metaAccessToken', ''], ['metaPhoneNumberId', ''], ['metaWebhookToken', '']]);

export default function ConfiManager() {
  const [confi, setConfi] = useState(null);
  const [form, setForm] = useState(empty);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  useEffect(() => {
    api.get('/api/confi/GetConfiList').then((r) => {
      if (r.data?.result?.length > 0) {
        const c = r.data.result[0];
        setConfi(c);
        setForm({
          name:             c.name            || '',
          email:            c.email           || '',
          phone:            c.phone           || '',
          whatsappNumber:   c.whatsappNumber  || '',
          address:          c.address         || '',
          fb:               c.fb              || '',
          insta:            c.insta           || '',
          twitter:          c.twitter         || '',
          linkedIn:         c.linkedIn        || '',
          youtube:          c.youtube         || '',
          whatsappProvider: c.whatsappProvider || 'official',
          metaAccessToken:  c.metaAccessToken  || '',
          metaPhoneNumberId:c.metaPhoneNumberId|| '',
          metaWebhookToken: c.metaWebhookToken || '',
        });
      }
    }).catch(() => {});
  }, []);

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { showToast(`Logo must be under ${MAX_MB}MB`, 'error'); e.target.value = ''; return; }
    setLogo(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { showToast('Business name is required', 'warning'); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (logo) fd.append('logo', logo);

      if (confi?._id) {
        await api.put(`/api/confi/${confi._id}`, fd);
        showToast('Settings saved');
      } else {
        await api.post('/api/confi/add', fd);
        showToast('Settings created');
      }
      const r = await api.get('/api/confi/GetConfiList');
      if (r.data?.result?.length > 0) setConfi(r.data.result[0]);
    } catch { showToast('Save failed', 'error'); }
    finally { setLoading(false); }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Settings</Typography>

      {/* Business Info */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>Business Information</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {FIELDS.map((f) => (
            <TextField key={f.key} label={f.label} size="small" fullWidth required={f.required}
              value={form[f.key]} onChange={(e) => setForm((p) => ({ ...p, [f.key]: e.target.value }))} />
          ))}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {confi?.logo && <Avatar src={confi.logo} variant="rounded" sx={{ width: 60, height: 60 }} />}
            <Button variant="outlined" component="label" sx={{ textTransform: 'none' }}>
              {logo ? logo.name : 'Upload Logo (max 1MB)'}
              <input type="file" hidden accept="image/*" onChange={handleLogoChange} />
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* WhatsApp Bot Settings */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>WhatsApp Bot Settings</Typography>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Choose which WhatsApp API the bot uses to send auto-replies.
        </Typography>

        <ToggleButtonGroup
          value={form.whatsappProvider}
          exclusive
          onChange={(_, v) => { if (v) setForm((p) => ({ ...p, whatsappProvider: v })); }}
          sx={{ mb: 3 }}
        >
          <ToggleButton value="official" sx={{ textTransform: 'none', px: 3 }}>Official Meta API</ToggleButton>
          <ToggleButton value="baileys"  sx={{ textTransform: 'none', px: 3 }}>Baileys (Unofficial)</ToggleButton>
        </ToggleButtonGroup>

        {form.whatsappProvider === 'official' && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Set your Meta webhook URL to: <strong>https://sanju-sk-live.onrender.com/api/webhook</strong>
            </Alert>
            <TextField label="Phone Number ID" size="small" fullWidth value={form.metaPhoneNumberId}
              onChange={(e) => setForm((p) => ({ ...p, metaPhoneNumberId: e.target.value }))}
              helperText="From Meta Business Manager → WhatsApp → API Setup" />
            <TextField label="Access Token" size="small" fullWidth value={form.metaAccessToken}
              onChange={(e) => setForm((p) => ({ ...p, metaAccessToken: e.target.value }))}
              type="password" helperText="Permanent system user token or temporary token" />
            <TextField label="Webhook Verify Token" size="small" fullWidth value={form.metaWebhookToken}
              onChange={(e) => setForm((p) => ({ ...p, metaWebhookToken: e.target.value }))}
              helperText="Any random string you set in Meta webhook configuration" />
          </Box>
        )}

        {form.whatsappProvider === 'baileys' && (
          <Alert severity="warning">
            Baileys (QR-scan) support requires the backend to be running persistently (not serverless). Contact your developer to enable this mode.
          </Alert>
        )}
      </Paper>

      <Button variant="contained" size="large" onClick={handleSave} disabled={loading} sx={{ textTransform: 'none', px: 5 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Settings'}
      </Button>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
