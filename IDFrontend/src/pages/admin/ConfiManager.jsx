import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Paper, CircularProgress,
  Avatar, Alert, Divider, Stepper, Step, StepLabel, StepContent,
} from '@mui/material';
import api from '../../api';
import { Toast } from '../../components/admin/AdminUiKit';

const MAX_MB = 1;

const FIELDS = [
  { key: 'name',           label: 'Business Name',    required: true },
  { key: 'email',          label: 'Email' },
  { key: 'phone',          label: 'Phone' },
  { key: 'whatsappNumber', label: 'WhatsApp Number (with country code e.g. 919876543210)' },
  { key: 'address',        label: 'Address' },
  { key: 'fb',             label: 'Facebook URL' },
  { key: 'insta',          label: 'Instagram URL' },
  { key: 'twitter',        label: 'Twitter URL' },
  { key: 'linkedIn',       label: 'LinkedIn URL' },
  { key: 'youtube',        label: 'YouTube URL' },
];

const WEBHOOK_URL = 'https://sanju-sk-live.onrender.com/api/webhook';

const empty = Object.fromEntries([
  ...FIELDS.map((f) => [f.key, '']),
  ['metaAccessToken', ''], ['metaPhoneNumberId', ''], ['metaWebhookToken', ''],
]);

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
          name:              c.name            || '',
          email:             c.email           || '',
          phone:             c.phone           || '',
          whatsappNumber:    c.whatsappNumber  || '',
          address:           c.address         || '',
          fb:                c.fb              || '',
          insta:             c.insta           || '',
          twitter:           c.twitter         || '',
          linkedIn:          c.linkedIn        || '',
          youtube:           c.youtube         || '',
          metaAccessToken:   c.metaAccessToken  || '',
          metaPhoneNumberId: c.metaPhoneNumberId || '',
          metaWebhookToken:  c.metaWebhookToken  || '',
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
      fd.append('whatsappProvider', 'official');
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

  const metaConfigured = !!(form.metaAccessToken && form.metaPhoneNumberId && form.metaWebhookToken);

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

      {/* WhatsApp Automation Setup */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600}>WhatsApp Automation (Meta Official API)</Typography>
          {metaConfigured
            ? <Alert severity="success" sx={{ py: 0 }}>Connected</Alert>
            : <Alert severity="warning" sx={{ py: 0 }}>Not configured</Alert>
          }
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          This system uses the <strong>Meta (Facebook) Official WhatsApp Business API</strong> for fully automated, serverless WhatsApp messaging — no QR scan needed, runs 24/7 without any human involvement.
        </Alert>

        <Stepper orientation="vertical" nonLinear sx={{ mb: 3 }}>
          <Step active>
            <StepLabel>Create a Meta Business Account</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                Go to <strong>business.facebook.com</strong> → Create account → Add WhatsApp to your business.
              </Typography>
            </StepContent>
          </Step>
          <Step active>
            <StepLabel>Get your Phone Number ID & Access Token</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                In Meta Business Manager → WhatsApp → API Setup → copy <strong>Phone Number ID</strong> and generate a <strong>System User Token</strong> (permanent).
              </Typography>
            </StepContent>
          </Step>
          <Step active>
            <StepLabel>Configure Webhook</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                In Meta → WhatsApp → Configuration → Webhook, set:
              </Typography>
              <Alert severity="info" sx={{ py: 0.5, mb: 0.5 }}>
                <strong>Callback URL:</strong> <code>{WEBHOOK_URL}</code>
              </Alert>
              <Alert severity="info" sx={{ py: 0.5 }}>
                <strong>Verify Token:</strong> Use the "Webhook Verify Token" you enter below.
              </Alert>
            </StepContent>
          </Step>
        </Stepper>

        <Divider sx={{ mb: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Phone Number ID"
            size="small"
            fullWidth
            value={form.metaPhoneNumberId}
            onChange={(e) => setForm((p) => ({ ...p, metaPhoneNumberId: e.target.value }))}
            helperText="Meta Business Manager → WhatsApp → API Setup"
          />
          <TextField
            label="Access Token (System User)"
            size="small"
            fullWidth
            type="password"
            value={form.metaAccessToken}
            onChange={(e) => setForm((p) => ({ ...p, metaAccessToken: e.target.value }))}
            helperText="Generate a permanent system user token — do NOT use the temporary test token"
          />
          <TextField
            label="Webhook Verify Token"
            size="small"
            fullWidth
            value={form.metaWebhookToken}
            onChange={(e) => setForm((p) => ({ ...p, metaWebhookToken: e.target.value }))}
            helperText="Any random secret string you set in Meta webhook configuration"
          />
        </Box>

        <Alert severity="success" sx={{ mt: 2 }}>
          <strong>Automation is fully zero-human:</strong> When a customer clicks WhatsApp on any product, their enquiry is auto-replied with product details and saved as a lead in your dashboard — no manual intervention needed.
        </Alert>
      </Paper>

      <Button variant="contained" size="large" onClick={handleSave} disabled={loading} sx={{ textTransform: 'none', px: 5 }}>
        {loading ? <CircularProgress size={20} color="inherit" /> : 'Save Settings'}
      </Button>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
