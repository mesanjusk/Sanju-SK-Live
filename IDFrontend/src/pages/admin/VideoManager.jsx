import { useState, useEffect } from 'react';
import {
  Box, Button, TextField, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, IconButton, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions, ToggleButton, ToggleButtonGroup,
  Chip,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
import api from '../../api';
import { ConfirmDialog, Toast } from '../../components/admin/AdminUiKit';

const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return m ? m[1] : null;
};

const EMPTY_FORM = { title: '', youtubeUrl: '', instagramUrl: '', platform: 'youtube', description: '' };

function PlatformToggle({ value, onChange }) {
  return (
    <ToggleButtonGroup value={value} exclusive onChange={(_, v) => v && onChange(v)} size="small" sx={{ mb: 1 }}>
      <ToggleButton value="youtube" sx={{ gap: 0.5, textTransform: 'none', px: 2 }}>
        <YouTubeIcon sx={{ color: '#FF0000', fontSize: 18 }} /> YouTube
      </ToggleButton>
      <ToggleButton value="instagram" sx={{ gap: 0.5, textTransform: 'none', px: 2 }}>
        <InstagramIcon sx={{ color: '#dd2a7b', fontSize: 18 }} /> Instagram
      </ToggleButton>
    </ToggleButtonGroup>
  );
}

export default function VideoManager() {
  const [videos, setVideos] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState({ open: false, id: null });
  const [editDialog, setEditDialog] = useState({ open: false, id: null, ...EMPTY_FORM });
  const [editLoading, setEditLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });

  const showToast = (msg, sev = 'success') => setToast({ open: true, message: msg, severity: sev });
  const setF = (key, val) => setForm((f) => ({ ...f, [key]: val }));
  const setE = (key, val) => setEditDialog((p) => ({ ...p, [key]: val }));

  const fetchVideos = async () => {
    const res = await api.get('/api/videos');
    setVideos(Array.isArray(res.data) ? res.data : []);
  };
  useEffect(() => { fetchVideos(); }, []);

  const validate = (data) => {
    if (!data.title.trim()) { showToast('Title is required', 'error'); return false; }
    if (data.platform === 'youtube' && !getYouTubeId(data.youtubeUrl)) {
      showToast('Enter a valid YouTube URL', 'error'); return false;
    }
    if (data.platform === 'instagram' && !data.instagramUrl.trim()) {
      showToast('Enter an Instagram URL', 'error'); return false;
    }
    return true;
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!validate(form)) return;
    setLoading(true);
    try {
      await api.post('/api/videos', form);
      setForm(EMPTY_FORM);
      await fetchVideos();
      showToast('Video added successfully');
    } catch { showToast('Failed to add video', 'error'); }
    finally { setLoading(false); }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/api/videos/${confirm.id}`);
      setConfirm({ open: false, id: null });
      await fetchVideos();
      showToast('Video deleted');
    } catch { showToast('Failed to delete', 'error'); }
  };

  const handleUpdate = async () => {
    if (!validate(editDialog)) return;
    setEditLoading(true);
    try {
      await api.put(`/api/videos/${editDialog.id}`, editDialog);
      setEditDialog({ open: false, id: null, ...EMPTY_FORM });
      await fetchVideos();
      showToast('Video updated');
    } catch { showToast('Failed to update', 'error'); }
    finally { setEditLoading(false); }
  };

  const openEdit = (v) => setEditDialog({
    open: true, id: v._id,
    title: v.title, description: v.description || '',
    platform: v.platform || 'youtube',
    youtubeUrl: v.youtubeUrl || '',
    instagramUrl: v.instagramUrl || '',
  });

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h5" fontWeight={600} mb={3}>Video Manager</Typography>

      {/* ── Add form ── */}
      <Paper elevation={0} variant="outlined" sx={{ p: 3, mb: 4, borderRadius: 3 }}>
        <Typography variant="subtitle2" fontWeight={600} mb={2}>Add Video</Typography>
        <Box component="form" onSubmit={handleAdd} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PlatformToggle value={form.platform} onChange={(v) => setF('platform', v)} />
          <TextField
            label="Title" size="small" required fullWidth
            value={form.title} onChange={(e) => setF('title', e.target.value)}
          />
          {form.platform === 'youtube' ? (
            <TextField
              label="YouTube URL (regular or Shorts)" size="small" required fullWidth
              placeholder="https://www.youtube.com/watch?v=... or /shorts/..."
              value={form.youtubeUrl} onChange={(e) => setF('youtubeUrl', e.target.value)}
              error={!!form.youtubeUrl && !getYouTubeId(form.youtubeUrl)}
              helperText={form.youtubeUrl && !getYouTubeId(form.youtubeUrl) ? 'Invalid YouTube URL' : ''}
            />
          ) : (
            <TextField
              label="Instagram Post / Reel URL" size="small" required fullWidth
              placeholder="https://www.instagram.com/p/... or /reel/..."
              value={form.instagramUrl} onChange={(e) => setF('instagramUrl', e.target.value)}
            />
          )}
          <TextField
            label="Description (optional)" size="small" fullWidth multiline rows={2}
            value={form.description} onChange={(e) => setF('description', e.target.value)}
          />
          <Box>
            <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>
              {loading ? <CircularProgress size={18} color="inherit" /> : 'Add Video'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* ── Table ── */}
      <TableContainer component={Paper} elevation={0} variant="outlined" sx={{ borderRadius: 3 }}>
        <Table size="small">
          <TableHead sx={{ bgcolor: 'primary.light' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>Preview</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>Platform</TableCell>
              <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {videos.map((v) => {
              const ytId = getYouTubeId(v.youtubeUrl);
              const isYT = (v.platform || 'youtube') === 'youtube';
              return (
                <TableRow key={v._id} hover>
                  <TableCell>
                    <Box sx={{ position: 'relative', width: 64, height: 48, borderRadius: 1, overflow: 'hidden', bgcolor: isYT ? '#000' : '#dd2a7b22', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isYT && ytId ? (
                        <>
                          <img src={`https://img.youtube.com/vi/${ytId}/default.jpg`} alt={v.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <PlayArrowIcon sx={{ position: 'absolute', color: 'white', fontSize: 20 }} />
                        </>
                      ) : (
                        <InstagramIcon sx={{ color: '#dd2a7b', fontSize: 28 }} />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" fontWeight={500} noWrap>{v.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {isYT ? v.youtubeUrl : v.instagramUrl}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={isYT ? <YouTubeIcon /> : <InstagramIcon />}
                      label={isYT ? 'YouTube' : 'Instagram'}
                      size="small"
                      sx={{ bgcolor: isYT ? '#FF000015' : '#dd2a7b15', color: isYT ? '#CC0000' : '#dd2a7b', fontWeight: 600, '& .MuiChip-icon': { color: 'inherit' } }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton size="small" color="primary" onClick={() => openEdit(v)}><EditIcon fontSize="small" /></IconButton>
                    <IconButton size="small" color="error" onClick={() => setConfirm({ open: true, id: v._id })}><DeleteIcon fontSize="small" /></IconButton>
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

      {/* ── Confirm delete ── */}
      <ConfirmDialog open={confirm.open} title="Delete Video" message="Delete this video?" onConfirm={handleDelete} onCancel={() => setConfirm({ open: false, id: null })} />

      {/* ── Edit dialog ── */}
      <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, id: null, ...EMPTY_FORM })} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Video</DialogTitle>
        <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <PlatformToggle value={editDialog.platform} onChange={(v) => setE('platform', v)} />
          <TextField label="Title" size="small" fullWidth autoFocus value={editDialog.title} onChange={(e) => setE('title', e.target.value)} />
          {editDialog.platform === 'youtube' ? (
            <TextField
              label="YouTube URL" size="small" fullWidth
              value={editDialog.youtubeUrl} onChange={(e) => setE('youtubeUrl', e.target.value)}
              error={!!editDialog.youtubeUrl && !getYouTubeId(editDialog.youtubeUrl)}
              helperText={editDialog.youtubeUrl && !getYouTubeId(editDialog.youtubeUrl) ? 'Invalid YouTube URL' : ''}
            />
          ) : (
            <TextField label="Instagram URL" size="small" fullWidth value={editDialog.instagramUrl} onChange={(e) => setE('instagramUrl', e.target.value)} />
          )}
          <TextField label="Description (optional)" size="small" fullWidth multiline rows={2} value={editDialog.description} onChange={(e) => setE('description', e.target.value)} />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setEditDialog({ open: false, id: null, ...EMPTY_FORM })} variant="outlined" color="inherit">Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" disabled={editLoading || !editDialog.title.trim()}>
            {editLoading ? <CircularProgress size={16} color="inherit" /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast open={toast.open} message={toast.message} severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))} />
    </Box>
  );
}
