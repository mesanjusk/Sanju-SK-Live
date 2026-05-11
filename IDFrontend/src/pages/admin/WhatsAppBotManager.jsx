import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Switch,
  FormControlLabel, Alert,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const emptyForm = { keyword: '', matchType: 'contains', reply: '', isActive: true, delaySeconds: 2 };

export default function WhatsAppBotManager() {
  const [rules, setRules] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [testText, setTestText] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testing, setTesting] = useState(false);

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  const fetchRules = async () => {
    const r = await api.get('/api/auto-reply');
    setRules(r.data?.result || []);
  };
  useEffect(() => { fetchRules(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (rule) => {
    setForm({ keyword: rule.keyword, matchType: rule.matchType, reply: rule.reply, isActive: rule.isActive, delaySeconds: rule.delaySeconds ?? 2 });
    setEditId(rule._id); setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.keyword.trim() || !form.reply.trim()) { showToast('Keyword and reply are required', 'warning'); return; }
    setLoading(true);
    try {
      if (editId) { await api.put(`/api/auto-reply/${editId}`, form); showToast('Rule updated'); }
      else { await api.post('/api/auto-reply', form); showToast('Rule added'); }
      setDialogOpen(false);
      await fetchRules();
    } catch { showToast('Operation failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/api/auto-reply/${confirm.id}`); setConfirm({ open: false, id: null }); await fetchRules(); showToast('Rule deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  const handleToggle = async (rule) => {
    try {
      await api.put(`/api/auto-reply/${rule._id}`, { ...rule, isActive: !rule.isActive });
      await fetchRules();
    } catch { showToast('Toggle failed', 'error'); }
  };

  const handleTest = async () => {
    if (!testText.trim()) return;
    setTesting(true);
    try {
      const r = await api.post('/api/auto-reply/test', { text: testText });
      setTestResult(r.data);
    } catch { showToast('Test failed', 'error'); }
    finally { setTesting(false); }
  };

  return (
    <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={600}>WhatsApp Bot</Typography>
          <Typography variant="body2" color="text.secondary">Auto-reply rules — when a customer sends a keyword, the bot replies instantly.</Typography>
        </Box>
        <Button variant="contained" onClick={openAdd} sx={{ textTransform: 'none' }}>Add Rule</Button>
      </Box>

      {/* Test simulator */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 3, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>Test Simulator</Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
          <TextField size="small" label="Simulate incoming message" value={testText} onChange={(e) => setTestText(e.target.value)}
            sx={{ flex: 1, minWidth: 220 }} onKeyDown={(e) => { if (e.key === 'Enter') handleTest(); }} />
          <Button variant="outlined" onClick={handleTest} disabled={testing} startIcon={<SendIcon />} sx={{ textTransform: 'none' }}>
            {testing ? <CircularProgress size={16} /> : 'Test'}
          </Button>
        </Box>
        {testResult && (
          <Box mt={1.5}>
            {testResult.matched
              ? <Alert severity="success">Bot would reply: <strong>{testResult.reply}</strong></Alert>
              : <Alert severity="info">No matching rule — bot would not reply.</Alert>}
          </Box>
        )}
      </Paper>

      <Alert severity="info" sx={{ mb: 3 }}>
        Make sure your WhatsApp provider and credentials are configured in <strong>Settings</strong>.
        Webhook URL: <strong>https://sanju-sk-live.onrender.com/api/webhook</strong>
      </Alert>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Keyword</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Match</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Reply</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Delay</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Active</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rules.map((rule) => (
              <TableRow key={rule._id} hover>
                <TableCell><Chip label={rule.keyword} size="small" /></TableCell>
                <TableCell><Chip label={rule.matchType} size="small" variant="outlined" /></TableCell>
                <TableCell sx={{ maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{rule.reply}</TableCell>
                <TableCell>{rule.delaySeconds ?? 2}s</TableCell>
                <TableCell>
                  <Switch size="small" checked={rule.isActive} onChange={() => handleToggle(rule)} color="primary" />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEdit(rule)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: rule._id })}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {rules.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>No rules yet. Add your first auto-reply rule.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Rule' : 'Add Auto-Reply Rule'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Keyword (customer types this)" size="small" required fullWidth value={form.keyword}
            onChange={(e) => setForm((p) => ({ ...p, keyword: e.target.value }))} />
          <TextField select label="Match Type" size="small" fullWidth value={form.matchType}
            onChange={(e) => setForm((p) => ({ ...p, matchType: e.target.value }))}>
            <MenuItem value="contains">Contains</MenuItem>
            <MenuItem value="exact">Exact Match</MenuItem>
            <MenuItem value="starts_with">Starts With</MenuItem>
          </TextField>
          <TextField label="Reply Message (bot sends this)" size="small" required multiline rows={3} fullWidth value={form.reply}
            onChange={(e) => setForm((p) => ({ ...p, reply: e.target.value }))} />
          <TextField label="Delay (seconds)" type="number" size="small" value={form.delaySeconds} inputProps={{ min: 0, max: 30 }}
            onChange={(e) => setForm((p) => ({ ...p, delaySeconds: Number(e.target.value) }))} sx={{ width: 160 }} />
          <FormControlLabel control={<Switch checked={form.isActive} onChange={(e) => setForm((p) => ({ ...p, isActive: e.target.checked }))} color="primary" />}
            label="Active" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Add Rule')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirm.open} title="Delete Rule" message="Delete this auto-reply rule?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
