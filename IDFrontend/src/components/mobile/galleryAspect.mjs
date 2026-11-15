// Compute the maximum displayed height at a shared width, not the largest
// pixel count. This keeps portrait, landscape, and square photos in one
// unchanged frame without cropping any of them.
export const DEFAULT_GALLERY_HEIGHT_RATIO = 1.35;
export function largestGalleryHeightRatio(dimensions, fallback=DEFAULT_GALLERY_HEIGHT_RATIO) {
  const ratios = (Array.isArray(dimensions) ? dimensions : [])
    .map(item => {
      const width = Number(item?.width), height = Number(item?.height);
      return Number.isFinite(width) && width>0 && Number.isFinite(height) && height>0
        ? height/width : null;
    }).filter(value => value!==null);
  if (!ratios.length) return fallback;
  // Extremely thin banners and exceptionally long images are still completely
  // visible: CSS object-fit:contain ensures we never crop them.
  return Math.max(0.55,Math.min(5,Math.max(...ratios)));
}
