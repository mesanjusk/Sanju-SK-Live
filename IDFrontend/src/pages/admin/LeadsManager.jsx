import { useState, useEffect, useCallback } from 'react';
import {
  Box, Button, Typography, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, IconButton, Chip, Select, MenuItem,
  FormControl, InputLabel, TextField, Dialog, DialogTitle, DialogContent,
  DialogActions, CircularProgress, Grid, Card, CardContent, Tooltip,
  InputAdornment,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import SearchIcon from '@mui/icons-material/Search';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import PersonIcon from '@mui/icons-material/Person';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const STATUS_OPTIONS = ['new', 'contacted', 'qualified', 'closed', 'lost'];
const STATUS_COLORS = {
  new: 'info', contacted: 'warning', qualified: 'success', closed: 'default', lost: 'error',
};

const emptyForm = { status: 'new', notes: '', assignedTo: '', name: '', phone: '' };

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      if (search) params.search = search;
      const r = await api.get('/api/leads', { params });
      setLeads(r.data?.result || []);
    } catch { showToast('Failed to load leads', 'error'); }
    finally { setLoading(false); }
  }, [filterStatus, search]);

  const fetchStats = async () => {
    try {
      const r = await api.get('/api/leads/stats');
      setStats(r.data || {});
    } catch {}
  };

  const fetchUsers = async () => {
    try {
      const r = await api.get('/api/users/GetUserList');
      setUsers(r.data?.result || []);
    } catch {}
  };

  useEffect(() => { fetchLeads(); fetchStats(); fetchUsers(); }, [fetchLeads]);

  const openEdit = (lead) => {
    setForm({
      status: lead.status || 'new',
      notes: lead.notes || '',
      assignedTo: lead.assignedTo?._id || lead.assignedTo || '',
      name: lead.name || '',
      phone: lead.phone || '',
    });
    setEditId(lead._id);
    setDialogOpen(true);
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };

  const handleSave = async () => {
    try {
      if (editId) {
        await api.put(`/api/leads/${editId}`, form);
        showToast('Lead updated');
      } else {
        await api.post('/api/leads', { ...form, source: 'manual' });
        showToast('Lead created');
      }
      setDialogOpen(false);
      await fetchLeads();
      await fetchStats();
    } catch { showToast('Save failed', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/leads/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchLeads();
      await fetchStats();
      showToast('Lead deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const quickStatus = async (id, status) => {
    try {
      await api.put(`/api/leads/${id}`, { status });
      setLeads((prev) => prev.map((l) => l._id === id ? { ...l, status } : l));
      await fetchStats();
    } catch { showToast('Update failed', 'error'); }
  };

  const openWhatsApp = (phone) => {
    if (phone) window.open(`https://wa.me/${String(phone).replace(/\D/g, '')}`, '_blank');
  };

  return (
    <Box sx={{ maxWidth: 1100, mx: 'auto' }}>
      {/* Stats row */}
      <Grid container spacing={2} mb={3}>
        {[
          { label: 'Total Leads', value: stats.total ?? 0, color: '#2e7d32' },
          { label: 'Today', value: stats.today ?? 0, color: '#1976d2' },
          { label: 'This Week', value: stats.thisWeek ?? 0, color: '#ed6c02' },
          { label: 'New', value: stats.byStatus?.new ?? 0, color: '#0288d1' },
          { label: 'Qualified', value: stats.byStatus?.qualified ?? 0, color: '#388e3c' },
          { label: 'Closed', value: stats.byStatus?.closed ?? 0, color: '#757575' },
        ].map(({ label, value, color }) => (
          <Grid item xs={6} sm={4} md={2} key={label}>
            <Card elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Header + filters */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" fontWeight={600} sx={{ flex: 1 }}>
          <LeaderboardIcon sx={{ mr: 1, verticalAlign: 'middle' }} />Leads
        </Typography>
        <TextField
          size="small" placeholder="Search name / phone / product…" value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment> }}
          sx={{ width: 220 }}
        />
        <FormControl size="small" sx={{ minWidth: 140 }}>
          <InputLabel>Status</InputLabel>
          <Select value={filterStatus} label="Status" onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
          </Select>
        </FormControl>
        <Button variant="contained" onClick={openAdd} sx={{ textTransform: 'none' }}>+ Add Lead</Button>
      </Box>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Assigned</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4 }}><CircularProgress size={24} /></TableCell></TableRow>
            ) : leads.length === 0 ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>No leads found</TableCell></TableRow>
            ) : leads.map((lead) => (
              <TableRow key={lead._id} hover>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <PersonIcon fontSize="small" color="action" />
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{lead.name || '—'}</Typography>
                      <Typography variant="caption" color="text.secondary">{lead.phone || '—'}</Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {lead.productName || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip label={lead.source || 'whatsapp'} size="small" color={lead.source === 'whatsapp' ? 'success' : 'default'} />
                </TableCell>
                <TableCell>
                  <Select
                    value={lead.status || 'new'} size="small" variant="standard"
                    onChange={(e) => quickStatus(lead._id, e.target.value)}
                    sx={{ fontSize: 13 }}
                  >
                    {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{lead.assignedTo?.User_name || '—'}</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="caption">{new Date(lead.createdAt).toLocaleDateString('en-IN')}</Typography>
                </TableCell>
                <TableCell align="right">
                  {lead.phone && (
                    <Tooltip title="Open WhatsApp">
                      <IconButton size="small" sx={{ color: '#25D366' }} onClick={() => openWhatsApp(lead.phone)}>
                        <WhatsAppIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton size="small" color="primary" onClick={() => openEdit(lead)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: lead._id })}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit/Add Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Lead' : 'Add Lead'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Contact Name" size="small" fullWidth value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Phone (with country code)" size="small" fullWidth value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <FormControl size="small" fullWidth>
            <InputLabel>Status</InputLabel>
            <Select value={form.status} label="Status" onChange={(e) => setForm({ ...form, status: e.target.value })}>
              {STATUS_OPTIONS.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" fullWidth>
            <InputLabel>Assign To</InputLabel>
            <Select value={form.assignedTo} label="Assign To" onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}>
              <MenuItem value="">Unassigned</MenuItem>
              {users.map((u) => <MenuItem key={u._id} value={u._id}>{u.User_name} ({u.role || 'admin'})</MenuItem>)}
            </Select>
          </FormControl>
          <TextField label="Notes" size="small" fullWidth multiline rows={3} value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" sx={{ textTransform: 'none' }}>
            {editId ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirm.open} title="Delete Lead" message="Are you sure you want to delete this lead?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
