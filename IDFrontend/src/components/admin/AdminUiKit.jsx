import {
  Box, Typography, Paper, Card, CardContent, Breadcrumbs,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
  Button, Snackbar, Alert,
} from '@mui/material';

export function StatCard({ label, value, Icon }) {
  return (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, transition: 'box-shadow .2s', '&:hover': { boxShadow: 3 } }}>
      <CardContent sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={600} textTransform="uppercase" letterSpacing={1}>
            {label}
          </Typography>
          <Typography variant="h4" fontWeight={700} mt={0.5}>{value ?? '—'}</Typography>
        </Box>
        {Icon && (
          <Box sx={{ bgcolor: 'primary.light', p: 1.5, borderRadius: 2, color: 'primary.dark', display: 'flex' }}>
            <Icon />
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export function SurfaceCard({ children, sx = {} }) {
  return (
    <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, p: 3, ...sx }}>
      {children}
    </Paper>
  );
}

export function PageContainer({ title, breadcrumb = [], actions, children }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', justifyContent: 'space-between', gap: 2 }}>
        <Box>
          {breadcrumb.length > 0 && (
            <Breadcrumbs sx={{ mb: 0.5 }}>
              {breadcrumb.map((item) => (
                <Typography key={item} variant="caption" color="text.secondary">{item}</Typography>
              ))}
            </Breadcrumbs>
          )}
          <Typography variant="h5" fontWeight={600}>{title}</Typography>
        </Box>
        {actions}
      </Box>
      {children}
    </Box>
  );
}

export function ConfirmDialog({ open, title = 'Confirm', message, onConfirm, onCancel, confirmColor = 'error' }) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{message}</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onCancel} variant="outlined" color="inherit">Cancel</Button>
        <Button onClick={onConfirm} variant="contained" color={confirmColor} autoFocus>Confirm</Button>
      </DialogActions>
    </Dialog>
  );
}

export function Toast({ open, message, severity = 'success', onClose }) {
  return (
    <Snackbar open={open} autoHideDuration={3000} onClose={onClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
