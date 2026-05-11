import { FaBell, FaChevronDown, FaSearch } from 'react-icons/fa';

export const adminTheme = {
  background: '#f6faf7',
  accent: '#7bc496',
  text: '#1f2937',
};

export function DashboardLayout({ sidebar, header, children }) {
  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#1f2937]">
      {sidebar}
      <div className="transition-all duration-300 lg:pl-[264px]">{header}<main className="p-4 md:p-6 lg:p-8">{children}</main></div>
    </div>
  );
}

export function PageContainer({ title, breadcrumb = [], actions, children }) {
  return <section className="space-y-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><Breadcrumbs items={breadcrumb} /><h2 className="text-2xl font-semibold tracking-tight">{title}</h2></div>{actions}</div>{children}</section>;
}

export function Breadcrumbs({ items = [] }) {
  return <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">{items.map((item, idx) => <span key={item + idx} className="inline-flex items-center gap-2">{idx > 0 && <span>/</span>}<span>{item}</span></span>)}</div>;
}

export function SearchBar({ placeholder = 'Search', className = '' }) {
  return <label className={`flex items-center gap-2 rounded-2xl border border-[#e5ede7] bg-[#f6faf7] px-3 py-2 ${className}`}><FaSearch className="text-gray-400" /><input className="w-full bg-transparent text-sm outline-none" placeholder={placeholder} /></label>;
}

export function FilterDropdown({ options = [], value, onChange }) {
  return <select value={value} onChange={onChange} className="rounded-2xl border border-[#e5ede7] bg-white px-3 py-2 text-sm text-gray-700 outline-none"><option value="">All</option>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
}

export function StatusBadge({ status }) {
  const map = { Active: 'bg-emerald-50 text-emerald-700', Pending: 'bg-amber-50 text-amber-700', Draft: 'bg-slate-100 text-slate-600' };
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
}

export function TopBar({ title }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[#e6efe8] bg-white/90 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
      <div><p className="text-xs text-gray-500">Admin Panel</p><h1 className="text-lg font-semibold">{title}</h1></div>
      <div className="flex items-center gap-3"><SearchBar className="hidden w-56 md:flex" /><button className="rounded-2xl border border-[#e5ede7] bg-white p-2.5 text-gray-600 shadow-sm"><FaBell /></button><button className="flex items-center gap-2 rounded-2xl border border-[#e5ede7] bg-white px-3 py-2 shadow-sm"><span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#7bc496] text-xs font-semibold text-white">A</span><span className="hidden text-sm font-medium sm:inline">Admin</span><FaChevronDown className="text-xs text-gray-500" /></button></div>
    </header>
  );
}

export function StatCard({ label, value, Icon }) { return <article className="rounded-2xl border border-[#e6efe8] bg-white p-5 shadow-[0_10px_30px_-20px_rgba(23,31,56,.3)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-22px_rgba(23,31,56,.35)]"><div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className="mt-2 text-3xl font-bold">{value ?? '—'}</p></div><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7f0] text-[#4f9f73]"><Icon /></div></div></article>; }

export function SurfaceCard({ children, className = '' }) { return <div className={`rounded-2xl border border-[#e6efe8] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(23,31,56,.3)] ${className}`}>{children}</div>; }

export function EmptyState({ title, description }) { return <SurfaceCard className="text-center"><h3 className="text-base font-semibold">{title}</h3><p className="mt-1 text-sm text-gray-500">{description}</p></SurfaceCard>; }
