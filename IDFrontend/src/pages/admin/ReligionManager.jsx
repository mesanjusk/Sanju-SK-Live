import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

export default function ReligionManager() {
  const [religions, setReligions] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [editDialog, setEditDialog] = useState({ open: false, id: null, name: '' });
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });
  const fetchReligions = async () => {
    const r = await api.get('/api/religions/GetReligionList');
    setReligions(r.data?.result || []);
  };
  useEffect(() => { fetchReligions(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/religions/add', { name });
      if (res.data === 'exist') { showToast('Religion already exists', 'warning'); }
      else { setName(''); await fetchReligions(); showToast('Religion added'); }
    } catch { showToast('Failed to add', 'error'); }
    finally { setLoading(false); }
  };

  const handleEdit = async () => {
    try {
      await api.put(`/api/religions/${editDialog.id}`, { name: editDialog.name });
      setEditDialog({ open: false, id: null, name: '' });
      await fetchReligions();
      showToast('Religion updated');
    } catch { showToast('Update failed', 'error'); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/religions/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchReligions();
      showToast('Religion deleted');
    } catch { showToast('Delete failed', 'error'); }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Religion Manager</Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add Religion</Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Religion Name" size="small" required value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Add'}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {religions.map((r) => (
              <TableRow key={r._id} hover>
                <TableCell>{r.name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => setEditDialog({ open: true, id: r._id, name: r.name })}><EditIcon fontSize="small" /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: r._id })}><DeleteIcon fontSize="small" /></IconButton>
                </TableCell>
              </TableRow>
            ))}
            {religions.length === 0 && <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>No religions yet</TableCell></TableRow>}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, id: null, name: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Religion</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField label="Name" size="small" fullWidth value={editDialog.name} onChange={(e) => setEditDialog((d) => ({ ...d, name: e.target.value }))} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog({ open: false, id: null, name: '' })} color="inherit">Cancel</Button>
          <Button onClick={handleEdit} variant="contained" sx={{ textTransform: 'none' }}>Update</Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog open={confirm.open} title="Delete Religion" message="Delete this religion?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
