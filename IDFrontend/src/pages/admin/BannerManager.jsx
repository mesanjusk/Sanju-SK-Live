import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Avatar,
  CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const MAX_MB = 1;
const emptyForm = { name: '', altText: '', ctaUrl: '' };

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [image, setImage] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  const fetch = async () => { const r = await api.get('/api/banners'); setBanners(Array.isArray(r.data) ? r.data : []); };
  useEffect(() => { fetch(); }, []);

  const openAdd = () => { setForm(emptyForm); setImage(null); setEditId(null); setDialogOpen(true); };
  const openEdit = (b) => { setForm({ name: b.name || '', altText: b.altText || '', ctaUrl: b.ctaUrl || '' }); setEditId(b._id); setDialogOpen(true); };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) { showToast(`Image must be under ${MAX_MB}MB`, 'error'); e.target.value = ''; return; }
    setImage(file);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/api/banners/${editId}`, form);
        showToast('Banner updated');
      } else {
        if (!image) { showToast('Please select an image', 'warning'); setLoading(false); return; }
        const fd = new FormData();
        fd.append('name', form.name);
        fd.append('altText', form.altText);
        fd.append('ctaUrl', form.ctaUrl);
        fd.append('image', image);
        await api.post('/api/banners', fd);
        showToast('Banner added');
      }
      setDialogOpen(false);
      await fetch();
    } catch { showToast('Operation failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try { await api.delete(`/api/banners/${confirm.id}`); setConfirm({ open: false, id: null }); await fetch(); showToast('Banner deleted'); }
    catch { showToast('Delete failed', 'error'); }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={600}>Banner Manager</Typography>
        <Button variant="contained" onClick={openAdd} sx={{ textTransform: 'none' }}>Add Banner</Button>
      </Box>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Link</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {banners.map((b) => (
              <TableRow key={b._id} hover>
                <TableCell><Avatar src={b.imageUrl} alt={b.name} variant="rounded" sx={{ width: 80, height: 40 }} /></TableCell>
                <TableCell>{b.name || '—'}</TableCell>
                <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.ctaUrl || '—'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => openEdit(b)}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: b._id })}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {banners.length === 0 && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No banners yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editId ? 'Edit Banner' : 'Add Banner'}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
          <TextField label="Banner Name" size="small" fullWidth value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <TextField label="Alt Text" size="small" fullWidth value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} />
          <TextField label="CTA URL (link)" size="small" fullWidth value={form.ctaUrl} onChange={(e) => setForm({ ...form, ctaUrl: e.target.value })} />
          {!editId && (
            <Button variant="outlined" component="label" sx={{ textTransform: 'none', alignSelf: 'flex-start' }}>
              {image ? image.name : 'Choose Image (max 1MB)'}
              <input type="file" hidden accept="image/*" onChange={handleImageChange} />
            </Button>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : (editId ? 'Update' : 'Add')}
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirm.open} title="Delete Banner" message="Delete this banner? This cannot be undone." onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
