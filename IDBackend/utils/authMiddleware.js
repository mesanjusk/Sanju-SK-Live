import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sk-admin-secret-change-in-prod';

export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(req, res, next) {
  // Accept token from Authorization header OR query param (for OAuth redirects)
  const authHeader = req.headers['authorization'];
  const queryToken = req.query.token;
  const token = queryToken || (authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null);

  if (!token) {
    return res.status(401).json({ success: false, status: 'fail', message: 'Authorization token is required', path: req.path + (req.query ? '?' + new URLSearchParams(req.query).toString() : '') });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, status: 'fail', message: 'Invalid or expired token' });
  }
}
