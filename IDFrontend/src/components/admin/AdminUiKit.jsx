import { FaBell, FaChevronDown, FaSearch } from 'react-icons/fa';

export function DashboardLayout({ sidebar, header, children, collapsed = false }) {
  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#1f2937]">
      {sidebar}
      <div className={collapsed ? 'lg:pl-[88px]' : 'lg:pl-[260px]'} style={{ transition: 'padding-left 0.2s' }}>
        {header}
        <main className="p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}

export function PageContainer({ title, breadcrumb = [], actions, children }) {
  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2 text-xs text-gray-500">
            {breadcrumb.map((item, idx) => (
              <span key={item + idx} className="inline-flex items-center gap-2">
                {idx > 0 && <span>/</span>}
                <span>{item}</span>
              </span>
            ))}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-[#1f2937]">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function TopBar({ title }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[#e6efe8] bg-white/90 px-4 py-4 backdrop-blur md:px-6 lg:px-8">
      <div>
        <p className="text-xs text-gray-500">Admin Panel</p>
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <label className="hidden items-center gap-2 rounded-2xl border border-[#e5ede7] bg-[#f6faf7] px-3 py-2 md:flex">
          <FaSearch className="text-gray-400" />
          <input className="w-44 bg-transparent text-sm outline-none" placeholder="Search" />
        </label>
        <button className="rounded-2xl border border-[#e5ede7] bg-white p-2.5 text-gray-600 shadow-sm"><FaBell /></button>
        <button className="flex items-center gap-2 rounded-2xl border border-[#e5ede7] bg-white px-3 py-2 shadow-sm">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#7bc496] text-xs font-semibold text-white">A</span>
          <span className="hidden text-sm font-medium sm:inline">Admin</span>
          <FaChevronDown className="text-xs text-gray-500" />
        </button>
      </div>
    </header>
  );
}

export function StatCard({ label, value, Icon }) {
  return (
    <article className="rounded-2xl border border-[#e6efe8] bg-white p-5 shadow-[0_10px_30px_-20px_rgba(23,31,56,.3)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-22px_rgba(23,31,56,.35)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-bold">{value ?? '—'}</p>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#edf7f0] text-[#4f9f73]"><Icon /></div>
      </div>
    </article>
  );
}

export function SurfaceCard({ children, className = '' }) {
  return <div className={`rounded-2xl border border-[#e6efe8] bg-white p-5 shadow-[0_10px_30px_-22px_rgba(23,31,56,.3)] ${className}`}>{children}</div>;
}
