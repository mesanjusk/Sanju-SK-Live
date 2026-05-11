import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

export default function PriceManager() {
  const [prices, setPrices] = useState([]);
  const [price, setPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchPrices = async () => {
    const res = await api.get('/api/prices/GetPriceList');
    setPrices(res.data?.result || []);
  };

  useEffect(() => { fetchPrices(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/api/prices/add', { price: Number(price) });
      if (res.data === 'exist') {
        showToast('Price already exists', 'warning');
      } else {
        setPrice('');
        await fetchPrices();
        showToast('Price added successfully');
      }
    } catch {
      showToast('Failed to add price', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/prices/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchPrices();
      showToast('Price deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 700, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Price Manager</Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add Price</Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Price (₹)" type="number" size="small" required
            value={price} onChange={(e) => setPrice(e.target.value)}
            inputProps={{ min: 0 }} sx={{ flex: 1, minWidth: 180 }}
          />
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none', whiteSpace: 'nowrap' }}>
            {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Price'}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Price</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {prices.map((p) => (
              <TableRow key={p._id} hover>
                <TableCell>₹{p.price}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: p._id })}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {prices.length === 0 && (
              <TableRow><TableCell colSpan={2} align="center" sx={{ py: 4, color: 'text.secondary' }}>No prices yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Price"
        message="Are you sure you want to delete this price?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
