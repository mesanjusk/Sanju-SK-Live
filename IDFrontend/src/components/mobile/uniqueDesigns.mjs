// Return each catalog design once. Duplicate database records or reused cover
// artwork should not fill multiple tiles in the Pinterest discovery feed.
export const designId = item => String(item?._id || item?.id || '').trim();

function primaryImage(item) {
  const photos = Array.isArray(item?.images) ? item.images : [item?.images || item?.imageUrl];
  const image = photos.find(photo => typeof photo === 'string' && photo.trim());
  if (!image) return '';
  // Query strings commonly contain cache/size parameters for the same artwork.
  const path = image.trim().split(/[?#]/, 1)[0];
  // Cloudinary may reformat or resize the same stored image for different cards.
  return path.replace(/(\/(?:image|video)\/upload\/)(?:[^/]+\/)*(?=v\d+\/)/, '$1');
}

export function uniqueDesigns(products = []) {
  if (!Array.isArray(products)) return [];
  const seenIds = new Set();
  const seenImages = new Set();
  const unique = [];
  for (const product of products) {
    const id = designId(product);
    // Pins and product links require a real ID. Skip incomplete catalog rows.
    if (!id || seenIds.has(id)) continue;
    const photo = primaryImage(product);
    if (photo && seenImages.has(photo)) continue;
    seenIds.add(id);
    if (photo) seenImages.add(photo);
    unique.push(product);
  }
  return unique;
}
