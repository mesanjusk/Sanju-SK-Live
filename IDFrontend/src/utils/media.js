// Cloudinary images are uploaded at high resolution. Use a lightweight
// transformed copy for cards; preserve original URLs for full-screen inspection.
// Only transform genuine Cloudinary image/upload URLs to avoid breaking other CDNs.
export function optimizedImage(src, width = 720) {
  if (typeof src !== 'string' || !src) return src || '';
  try {
    const url = new URL(src);
    if (url.protocol !== 'https:' || url.hostname !== 'res.cloudinary.com') return src;
    const parts = url.pathname.match(/^\/([^/]+)\/image\/upload\/(.+)$/);
    if (!parts || !parts[2]) return src;
    const size = Math.max(96, Math.min(1500, Math.round(Number(width) || 720)));
    url.pathname = `/${parts[1]}/image/upload/f_auto,q_auto:good,w_${size}/${parts[2]}`;
    return url.toString();
  } catch { return src; }
}
