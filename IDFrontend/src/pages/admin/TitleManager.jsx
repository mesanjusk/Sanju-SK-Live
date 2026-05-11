import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

export default function TitleManager() {
  const [titles, setTitles] = useState([]);
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchTitles = async () => {
    const res = await api.get('/api/titles/GetTitleList');
    setTitles(res.data?.result || []);
  };

  useEffect(() => { fetchTitles(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/titles/add', { name });
      if (res.data === 'exist') {
        showToast('Title already exists', 'warning');
      } else {
        setName('');
        await fetchTitles();
        showToast('Title added successfully');
      }
    } catch {
      showToast('Failed to add title', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/titles/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchTitles();
      showToast('Title deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Title Manager</Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add Title</Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField label="Title Name" size="small" required value={name} onChange={(e) => setName(e.target.value)} sx={{ flex: 1, minWidth: 200 }} />
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Title'}
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
            {titles.map((t) => (
              <TableRow key={t._id} hover>
                <TableCell>{t.name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: t._id })}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {titles.length === 0 && (
              <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>No titles yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Title"
        message="Are you sure you want to delete this title?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
