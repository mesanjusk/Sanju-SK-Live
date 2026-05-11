import { Link } from 'react-router-dom';
export default function ExploreGrid({ products = [] }) { return <div className="grid grid-cols-3 gap-1 px-4">{products.map((p) => <Link key={p._id} to={`/products/${p._id}`}><img src={(p.images||[])[0]} alt={p.title} className="aspect-square w-full rounded-xl object-cover" loading="lazy" /></Link>)}</div>; }
