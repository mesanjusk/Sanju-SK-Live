import { FaBell, FaChevronDown, FaSearch } from 'react-icons/fa';


export function DashboardLayout({ sidebar, header, children }) {
  return (
    <div className="min-h-screen bg-[#f6faf7] text-[#1f2937]">
      {sidebar}

    </div>
  );
}

export function PageContainer({ title, breadcrumb = [], actions, children }) {

}

export function TopBar({ title }) {
  return (
    <header className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-[#e6efe8] bg-white/90 px-4 py-4 backdrop-blur md:px-6 lg:px-8">

    </header>
  );
}


