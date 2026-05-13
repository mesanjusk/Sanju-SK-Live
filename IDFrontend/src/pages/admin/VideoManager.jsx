import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState({ title: '', youtubeUrl: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [editDialog, setEditDialog] = useState({ open: false, id: null, title: '', youtubeUrl: '', description: '' });
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (message, severity = 'success') => setToast({ open: true, message, severity });

  const fetchVideos = async () => {
    const res = await api.get('/api/videos');
    setVideos(Array.isArray(res.data) ? res.data : []);
  };

  useEffect(() => { fetchVideos(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!getYouTubeId(form.youtubeUrl)) {
      showToast('Please enter a valid YouTube URL', 'error');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/videos', form);
      setForm({ title: '', youtubeUrl: '', description: '' });
      await fetchVideos();
      showToast('Video added successfully');
    } catch {
      showToast('Failed to add video', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/videos/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchVideos();
      showToast('Video deleted');
    } catch {
      showToast('Failed to delete', 'error');
    }
  };

  const handleUpdate = async () => {
    if (!editDialog.title.trim() || !editDialog.youtubeUrl.trim()) return;
    if (!getYouTubeId(editDialog.youtubeUrl)) {
      showToast('Please enter a valid YouTube URL', 'error');
      return;
    }
    setEditLoading(true);
    try {
      await api.put(`/api/videos/${editDialog.id}`, {
        title: editDialog.title,
        youtubeUrl: editDialog.youtubeUrl,
        description: editDialog.description,
      });
      setEditDialog({ open: false, id: null, title: '', youtubeUrl: '', description: '' });
      await fetchVideos();
      showToast('Video updated');
    } catch {
      showToast('Failed to update', 'error');
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Video Manager</Typography>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add YouTube Video</Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Video Title" size="small" required fullWidth
            value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
          <TextField
            label="YouTube URL (regular or Shorts)" size="small" required fullWidth
            placeholder="https://www.youtube.com/watch?v=... or https://www.youtube.com/shorts/..."
            value={form.youtubeUrl} onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
            helperText={form.youtubeUrl && !getYouTubeId(form.youtubeUrl) ? 'Invalid YouTube URL' : ''}
            error={!!form.youtubeUrl && !getYouTubeId(form.youtubeUrl)}
          />
          <TextField
            label="Description (optional)" size="small" fullWidth multiline rows={2}
            value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          />
          <Box>
            <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Video'}
            </Button>
          </Box>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Thumbnail</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((v) => {
              const ytId = getYouTubeId(v.youtubeUrl);
              return (
                <TableRow key={v._id} hover>
                  <TableCell>
                    {ytId ? (
                      <Box sx={{ position: 'relative', width: 64, height: 48, borderRadius: 1, overflow: 'hidden', bgcolor: '#000' }}>
                        <img
                          src={`https://img.youtube.com/vi/${ytId}/default.jpg`}
                          alt={v.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <PlayArrowIcon sx={{ position: 'absolute', inset: 0, m: 'auto', color: 'white', fontSize: 20 }} />
                      </Box>
                    ) : (
                      <Box sx={{ width: 64, height: 48, bgcolor: 'grey.200', borderRadius: 1 }} />
                    )}
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>{v.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {v.youtubeUrl}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography variant="caption" color="text.secondary" noWrap>{v.description || '—'}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary"
                      onClick={() => setEditDialog({ open: true, id: v._id, title: v.title, youtubeUrl: v.youtubeUrl, description: v.description || '' })}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: v._id })}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
            {videos.length === 0 && (
              <TableRow><TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>No videos yet</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <ConfirmDialog
        open={confirm.open}
        title="Delete Video"
        message="Are you sure you want to delete this video?"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: null })}
      />

      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, id: null, title: '', youtubeUrl: '', description: '' })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Video</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="Video Title" size="small" fullWidth autoFocus
            value={editDialog.title}
            onChange={(e) => setEditDialog((p) => ({ ...p, title: e.target.value }))}
          />
          <TextField
            label="YouTube URL" size="small" fullWidth
            value={editDialog.youtubeUrl}
            onChange={(e) => setEditDialog((p) => ({ ...p, youtubeUrl: e.target.value }))}
            error={!!editDialog.youtubeUrl && !getYouTubeId(editDialog.youtubeUrl)}
            helperText={editDialog.youtubeUrl && !getYouTubeId(editDialog.youtubeUrl) ? 'Invalid YouTube URL' : ''}
          />
          <TextField
            label="Description (optional)" size="small" fullWidth multiline rows={2}
            value={editDialog.description}
            onChange={(e) => setEditDialog((p) => ({ ...p, description: e.target.value }))}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog({ open: false, id: null, title: '', youtubeUrl: '', description: '' })} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={editLoading || !editDialog.title.trim()}>
            {editLoading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
