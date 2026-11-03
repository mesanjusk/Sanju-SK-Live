import guides from '../../config/category-seo.json';

// Match exact catalog category names first, while supporting variations from admin.
const normalise = (name) => String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

export function getCategoryGuide(name) {
  const value = normalise(name);
  if (!value) return null;
  return guides.find((guide) =>
    [guide.name, ...guide.aliases].some(alias => normalise(alias) === value)) || null;
}

export default function CategorySeoBlurb({ name }) {
  if (!name) return null;
  const guide = getCategoryGuide(name);
  // Real categories without an authored guide still receive relevant, useful
  // content in the feed rather than an invented stock, price or turnaround.
  const intro = guide?.intro ||
    'Browse ' + name + ' designs from SANJU SK Digital in Gondia. Share your preferred design, size, quantity, ' +
    'artwork and required date so the team can confirm available options and provide a quotation.';
  const href = guide?.existingUrl || (guide?.slug ? '/categories/' + guide.slug + '/' : null);
  return (
    <div className="sk-category-seo-blurb">
      <p>{intro}</p>
      {href && <a href={href} aria-label={'Read the ' + name + ' guide in Gondia'}>
        Design options & ordering guide <span aria-hidden="true">→</span>
      </a>}
    </div>
  );
}
