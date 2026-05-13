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
const validateImage = (file, showToast) => {
  if (file && file.size > MAX_MB * 1024 * 1024) { showToast(`Image must be under ${MAX_MB}MB`, 'error'); return false; }
  return true;
};

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [editDialog, setEditDialog] = useState({ open: false, id: null, name: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchCategories = async () => {
    const res = await api.get('/api/categories');
    setCategories(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('image', image);
      await api.post('/api/categories', formData);
      setName('');
      setImage(null);
      await fetchCategories();
      showToast('Category added successfully');
    } catch {
      showToast('Failed to add category', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/categories/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchCategories();
      showToast('Category deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editDialog.name.trim()) return;
    setEditLoading(true);
    try {
      await api.put(`/api/categories/${editDialog.id}`, { name: editDialog.name });
      setEditDialog({ open: false, id: null, name: '' });
      await fetchCategories();
      showToast('Category updated');
    } catch {
      showToast('Failed to update', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Category Manager</Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add Category</Typography>
        <Box component="form" onSubmit={handleUpload} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Category Name" size="small" required fullWidth
            value={name} onChange={(e) => setName(e.target.value)}
          />
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
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Category'}
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
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat._id} hover>
                <TableCell>
                  <Avatar src={cat.imageUrl} alt={cat.name} variant="rounded" sx={{ width: 48, height: 48 }} />
                </TableCell>
                <TableCell>{cat.name}</TableCell>
                <TableCell align="right">
                  <IconButton size="small" color="primary" onClick={() => setEditDialog({ open: true, id: cat._id, name: cat.name })}>
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: cat._id })}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {categories.length === 0 && (
              <TableRow><TableCell colSpan={3} align="center" sx={{ py: 4, color: 'text.secondary' }}>No categories yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Category"
        message="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, id: null, name: '' })} maxWidth="xs" fullWidth>
        <DialogTitle>Edit Category</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <TextField
            label="Category Name" size="small" fullWidth autoFocus
            value={editDialog.name}
            onChange={(e) => setEditDialog((prev) => ({ ...prev, name: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog({ open: false, id: null, name: '' })} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={editLoading || !editDialog.name.trim()}>
            {editLoading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
