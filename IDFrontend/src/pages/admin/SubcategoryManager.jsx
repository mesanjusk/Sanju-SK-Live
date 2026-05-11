import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, MenuItem, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, Avatar, CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const MAX_MB = 1;
const validateImage = (file, showToast) => {
  if (file && file.size > MAX_MB * 1024 * 1024) { showToast(`Image must be under ${MAX_MB}MB`, 'error'); return false; }
  return true;
};

export default function SubcategoryManager() {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchAll = async () => {
    const [subRes, catRes] = await Promise.all([
      api.get('/api/subcategories'),
      api.get('/api/categories'),
    ]);
    setSubcategories(Array.isArray(subRes.data) ? subRes.data : subRes.data?.result || []);
    setCategories(Array.isArray(catRes.data) ? catRes.data : []);
  };

  useEffect(() => { fetchAll(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('categoryId', categoryId);
      formData.append('image', image);
      await api.post('/api/subcategories', formData);
      setName(''); setCategoryId(''); setImage(null);
      await fetchAll();
      showToast('Subcategory added successfully');
    } catch {
      showToast('Failed to add subcategory', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/subcategories/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchAll();
      showToast('Subcategory deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Subcategory Manager</Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add Subcategory</Typography>
        <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField label="Subcategory Name" size="small" required fullWidth value={name} onChange={(e) => setName(e.target.value)} />
          <TextField select label="Select Category" size="small" required fullWidth value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {categories.map((cat) => (
              <MenuItem key={cat._id} value={cat._id}>{cat.name}</MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" component="label" sx={{ alignSelf: 'flex-start', textTransform: 'none' }}>
            {image ? image.name : 'Choose Image (max 1MB)'}
            <input type="file" hidden accept="image/*" onChange={(e) => {
              const f = e.target.files[0];
              if (f && !validateImage(f, showToast)) { e.target.value = ''; return; }
              setImage(f);
            }} required />
          </Button>
          <Box>
            <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Subcategory'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Image</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {subcategories.map((sub) => (
              <TableRow key={sub._id} hover>
                <TableCell><Avatar src={sub.imageUrl} alt={sub.name} variant="rounded" sx={{ width: 48, height: 48 }} /></TableCell>
                <TableCell>{sub.name}</TableCell>
                <TableCell>{sub.categoryId?.name || '—'}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: sub._id })}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {subcategories.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No subcategories yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Subcategory"
        message="Are you sure you want to delete this subcategory?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />
      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
