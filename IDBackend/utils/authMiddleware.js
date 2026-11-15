import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if(!JWT_SECRET)console.error('JWT_SECRET is required for protected administrator routes.');

export function generateToken(payload) {
  if(!JWT_SECRET)throw new Error('Admin JWT signing secret is not configured');
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(req, res, next) {
  if(!JWT_SECRET)return res.status(503).json({message:'Admin authentication is not configured.'});
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

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
