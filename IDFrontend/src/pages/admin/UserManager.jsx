import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip, Select, MenuItem,
  FormControl, InputLabel, Accordion, AccordionSummary, AccordionDetails,
  FormControlLabel, Switch, Divider, Tooltip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const ROLES = ['admin', 'manager', 'sales', 'viewer'];
const ROLE_COLORS = { admin: 'error', manager: 'warning', sales: 'info', viewer: 'default' };

const ROLE_DEFAULTS = {
  admin:   { canViewDashboard: true, canViewAnalytics: true, canManageProducts: true, canManageCategories: true, canManageBanners: true, canManageLeads: true, canManageUsers: true, canManageSettings: true, canManageWhatsApp: true },
  manager: { canViewDashboard: true, canViewAnalytics: true, canManageProducts: true, canManageCategories: true, canManageBanners: true, canManageLeads: true, canManageUsers: false, canManageSettings: false, canManageWhatsApp: true },
  sales:   { canViewDashboard: true, canViewAnalytics: true, canManageProducts: false, canManageCategories: false, canManageBanners: false, canManageLeads: true, canManageUsers: false, canManageSettings: false, canManageWhatsApp: false },
  viewer:  { canViewDashboard: true, canViewAnalytics: true, canManageProducts: false, canManageCategories: false, canManageBanners: false, canManageLeads: false, canManageUsers: false, canManageSettings: false, canManageWhatsApp: false },
};

const PERMISSION_LABELS = {
  canViewDashboard:    'View Dashboard',
  canViewAnalytics:    'View Analytics',
  canManageProducts:   'Manage Products',
  canManageCategories: 'Manage Categories & Banners',
  canManageBanners:    'Manage Banners',
  canManageLeads:      'Manage Leads',
  canManageUsers:      'Manage Users',
  canManageSettings:   'Manage Settings',
  canManageWhatsApp:   'Manage WhatsApp Bot',
};

const emptyForm = { User_name: '', Password: '', Mobile_number: '', role: 'admin', permissions: { ...ROLE_DEFAULTS.admin } };

export default function UserManager() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchUsers = async () => {
    const r = await api.get('/api/users/GetUserList');
    setUsers(r.data?.result || []);
  };
  useEffect(() => { fetchUsers(); }, []);

  const handleRoleChange = (role) => {
    setForm((p) => ({ ...p, role, permissions: { ...ROLE_DEFAULTS[role] } }));
  };

  const togglePermission = (key) => {
    setForm((p) => ({ ...p, permissions: { ...p.permissions, [key]: !p.permissions[key] } }));
  };

  const openAdd = () => { setForm(emptyForm); setEditId(null); setDialogOpen(true); };
  const openEdit = (u) => {
    setForm({
      User_name: u.User_name || '',
      Password: '',
      Mobile_number: u.Mobile_number || '',
      role: u.role || 'admin',
      permissions: { ...ROLE_DEFAULTS[u.role || 'admin'], ...(u.permissions || {}) },
    });
    setEditId(u._id);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.Password && !editId) { showToast('Password is required', 'warning'); setLoading(false); return; }
      if (editId) {
        await api.put(`/api/users/updateUser/${editId}`, payload);
        showToast('User updated');
      } else {
        const res = await api.post('/api/users/addUser', payload);
        if (res.data === 'exist') { showToast('Mobile number already registered', 'warning'); setLoading(false); return; }
        showToast('User added');
      }
      setDialogOpen(false);
      await fetchUsers();
    } catch { showToast('Operation failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/users/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchUsers();
      showToast('User deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  const loggedIn = localStorage.getItem('User_name');

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>User Manager</Typography>
        <Button variant="contained" onClick={openAdd} sx={{ textTransform: 'none' }}>Add User</Button>
      </Box>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Username</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Role</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Permissions</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>
                  {u.User_name}
                  {u.User_name === loggedIn && <Chip label="You" size="small" color="primary" sx={{ ml: 1 }} />}
                </TableCell>
                <TableCell>{u.Mobile_number || '—'}</TableCell>
                <TableCell>
                  <Chip label={u.role || 'admin'} size="small" color={ROLE_COLORS[u.role] || 'default'} />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {Object.entries(u.permissions || {}).filter(([, v]) => v).map(([k]) => (
                      <Tooltip key={k} title={PERMISSION_LABELS[k] || k}>
                        <Chip label={k.replace('can', '').replace(/([A-Z])/g, ' $1').trim()} size="small" variant="outlined" sx={{ fontSize: 10 }} />
                      </Tooltip>
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEdit(u)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" disabled={u.User_name === loggedIn}
                    onClick={() => setConfirm({ open: true, id: u._id })}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {users.length === 0 && (
              <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>No users found</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit User' : 'Add User'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Username" size="small" required fullWidth value={form.User_name}
            onChange={(e) => setForm({ ...form, User_name: e.target.value })} />
          <TextField label={editId ? 'New Password (leave blank to keep)' : 'Password'} type="password"
            size="small" fullWidth required={!editId} value={form.Password}
            onChange={(e) => setForm({ ...form, Password: e.target.value })} />
          <TextField label="Mobile Number" size="small" fullWidth value={form.Mobile_number}
            onChange={(e) => setForm({ ...form, Mobile_number: e.target.value })} />

          <FormControl size="small" fullWidth>
            <InputLabel>Role</InputLabel>
            <Select value={form.role} label="Role" onChange={(e) => handleRoleChange(e.target.value)}>
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={r} size="small" color={ROLE_COLORS[r]} />
                    <Typography variant="caption" color="text.secondary">
                      {r === 'admin' && '— Full access'}{r === 'manager' && '— No users/settings'}{r === 'sales' && '— Leads + view only'}{r === 'viewer' && '— Read-only dashboard'}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Divider />

          <Accordion elevation={0} variant="outlined" sx={{ borderRadius: '8px !important' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="body2" fontWeight={600}>Custom Permissions (override role defaults)</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.5 }}>
                {Object.entries(PERMISSION_LABELS).map(([key, label]) => (
                  <FormControlLabel
                    key={key}
                    control={
                      <Switch size="small" checked={!!form.permissions[key]}
                        onChange={() => togglePermission(key)} color="primary" />
                    }
                    label={<Typography variant="caption">{label}</Typography>}
                    sx={{ m: 0 }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirm.open} title="Delete User" message="Are you sure you want to delete this user?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
