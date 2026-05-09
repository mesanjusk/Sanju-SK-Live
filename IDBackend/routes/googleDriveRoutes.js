import express from 'express';
import { google } from 'googleapis';
import Confi from '../models/Confi.js';
import { verifyToken } from '../utils/authMiddleware.js';

const router = express.Router();

function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || `${process.env.BACKEND_URL || 'https://misbackend-e078.onrender.com'}/api/google-drive/callback`
  );
}

// GET /api/google-drive/connect?token=JWT&returnTo=URL
router.get('/connect', verifyToken, (req, res) => {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    return res.status(500).json({ success: false, message: 'Google OAuth credentials not configured' });
  }

  const returnTo = req.query.returnTo || `${process.env.FRONTEND_URL || 'https://dash.sanjusk.in'}/admin`;
  const oauth2Client = getOAuthClient();

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/drive.file'],
    state: encodeURIComponent(returnTo),
  });

  res.redirect(authUrl);
});

// GET /api/google-drive/callback
router.get('/callback', async (req, res) => {
  const { code, state } = req.query;
  const returnTo = state ? decodeURIComponent(state) : `${process.env.FRONTEND_URL || 'https://dash.sanjusk.in'}/admin`;

  if (!code) {
    return res.redirect(`${returnTo}?driveError=no_code`);
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);

    // Store refresh token in the first Confi record (or create a settings doc)
    const confi = await Confi.findOne({});
    if (confi) {
      confi.googleDriveRefreshToken = tokens.refresh_token || confi.googleDriveRefreshToken;
      confi.googleDriveConnected = true;
      await confi.save();
    }

    res.redirect(`${returnTo}?driveConnected=true`);
  } catch (err) {
    console.error('Google Drive callback error:', err);
    res.redirect(`${returnTo}?driveError=auth_failed`);
  }
});

// GET /api/google-drive/status
router.get('/status', verifyToken, async (req, res) => {
  try {
    const confi = await Confi.findOne({});
    res.json({ success: true, connected: !!(confi?.googleDriveConnected && confi?.googleDriveRefreshToken) });
  } catch {
    res.json({ success: false, connected: false });
  }
});

// POST /api/google-drive/disconnect
router.post('/disconnect', verifyToken, async (req, res) => {
  try {
    await Confi.updateMany({}, { $set: { googleDriveConnected: false, googleDriveRefreshToken: null } });
    res.json({ success: true, message: 'Google Drive disconnected' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to disconnect' });
  }
});

export default router;
