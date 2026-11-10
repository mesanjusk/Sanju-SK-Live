// Reshuffle every full pass, without omitting designs from any cycle.
// Preserve the current set; only reorder it to provide fresh inspiration.
export const itemKey = item => String(item?._id || item?.category_uuid || item?.id || '');

export function shuffleNextCycle(previous, random = Math.random) {
  if (previous.length < 2) return [...previous];
  const next = [...previous];
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.min(i, Math.max(0, Math.floor(random() * (i + 1))));
    [next[i], next[j]] = [next[j], next[i]];
  }
  // More than two designs: ensure the new arrangement differs from the last.
  if (next.length > 2 && next.every((item,i) => itemKey(item) === itemKey(previous[i]))) {
    [next[1], next[2]] = [next[2], next[1]];
  }
  // No obvious back-to-back repeat at the end/start of two full cycles.
  if (next.length > 2 && itemKey(next[0]) === itemKey(previous[previous.length - 1])) {
    const swap = next.findIndex((item,i) => i > 0 && itemKey(item) !== itemKey(previous[previous.length - 1]));
    if (swap > 0) [next[0], next[swap]] = [next[swap], next[0]];
  }
  return next;
}
