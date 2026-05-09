import { useEffect, useState } from 'react';
import {
  FaUsers, FaUserCheck, FaUserPlus, FaEye,
  FaWhatsapp, FaMobile, FaDesktop, FaTablet,
  FaCalendarDay, FaCalendarWeek, FaCalendar, FaInfinity,
} from 'react-icons/fa';
import api from '../../api';

function StatCard({ label, value, Icon, color, sub }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{value ?? '—'}</p>
          {sub && <p className="mt-1 text-xs text-gray-400">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl text-white ${color}`}>
          <Icon className="text-lg" />
        </div>
      </div>
    </div>
  );
}

function DeviceBar({ devices }) {
  const total = (devices?.mobile || 0) + (devices?.tablet || 0) + (devices?.desktop || 0);
  if (!total) return <p className="text-sm text-gray-400">No data yet</p>;
  const pct = (n) => Math.round(((n || 0) / total) * 100);

  return (
    <div className="space-y-3">
      {[
        { label: 'Mobile',  Icon: FaMobile,  key: 'mobile',  color: 'bg-[#25D366]' },
        { label: 'Desktop', Icon: FaDesktop, key: 'desktop', color: 'bg-blue-500' },
        { label: 'Tablet',  Icon: FaTablet,  key: 'tablet',  color: 'bg-purple-500' },
      ].map(({ label, Icon, key, color }) => (
        <div key={key}>
          <div className="mb-1 flex items-center justify-between text-xs font-medium text-gray-600">
            <span className="flex items-center gap-1.5"><Icon /> {label}</span>
            <span>{pct(devices[key])}% ({devices[key] || 0})</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div className={`h-2 rounded-full ${color} transition-all duration-700`} style={{ width: `${pct(devices[key])}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/api/analytics/summary')
      .then((res) => { setData(res.data); setError(''); })
      .catch(() => setError('Could not load analytics. Make sure the backend is running.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#25D366] border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-center text-sm text-red-600">
        {error}
        <button onClick={load} className="mt-3 block mx-auto rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">Retry</button>
      </div>
    );
  }

  const { today, week, month, allTime, topPages, waClicks, devices } = data || {};

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">Analytics</h2>
          <p className="text-sm text-gray-400">Visitor insights from your MongoDB tracking</p>
        </div>
        <button
          onClick={load}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 hover:border-[#25D366] hover:text-[#128C7E] transition-all"
        >
          ↻ Refresh
        </button>
      </div>

      {/* Period tabs */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today",    Icon: FaCalendarDay,  d: today,   color: 'bg-[#25D366]' },
          { label: "7 Days",   Icon: FaCalendarWeek, d: week,    color: 'bg-blue-500' },
          { label: "30 Days",  Icon: FaCalendar,     d: month,   color: 'bg-purple-500' },
          { label: "All Time", Icon: FaInfinity,     d: allTime, color: 'bg-amber-500' },
        ].map(({ label, Icon, d, color }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-gray-400">{label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-xl text-white text-xs ${color}`}>
                <Icon />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">{d?.total ?? 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Views</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{d?.unique ?? 0}</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wide">Unique</p>
              </div>
            </div>
            {d?.newVisitors !== undefined && (
              <div className="mt-3 rounded-lg bg-green-50 px-3 py-1.5 text-center">
                <span className="text-xs font-semibold text-[#128C7E]">+{d.newVisitors} new visitors</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Key metrics row */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="WhatsApp Clicks (month)"
          value={waClicks ?? 0}
          Icon={FaWhatsapp}
          color="bg-[#25D366]"
          sub="From product & CTA buttons"
        />
        <StatCard
          label="Total Visitors (all time)"
          value={allTime?.unique ?? 0}
          Icon={FaUsers}
          color="bg-blue-500"
          sub="Unique visitor IDs"
        />
        <StatCard
          label="Repeat Visitors"
          value={Math.max(0, (allTime?.total ?? 0) - (allTime?.unique ?? 0))}
          Icon={FaUserCheck}
          color="bg-purple-500"
          sub="Return sessions"
        />
      </div>

      {/* Bottom row: top pages + devices */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top pages */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-800">Top Pages (30 days)</h3>
          {topPages?.length ? (
            <div className="space-y-3">
              {topPages.map((page, i) => {
                const max = topPages[0]?.count || 1;
                return (
                  <div key={page.path}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-gray-700 truncate max-w-[180px]">
                        <span className="mr-1.5 font-bold text-[#128C7E]">#{i + 1}</span>{page.path}
                      </span>
                      <span className="font-semibold text-gray-600 ml-2">{page.count}</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-1.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] transition-all duration-700"
                        style={{ width: `${Math.round((page.count / max) * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No page data yet</p>
          )}
        </div>

        {/* Device split */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-800">Device Split (30 days)</h3>
          <DeviceBar devices={devices || {}} />

          {/* WA conversion rate */}
          {month?.total > 0 && (
            <div className="mt-6 rounded-xl bg-[#25D366]/10 p-4">
              <p className="text-xs font-semibold text-[#128C7E] uppercase tracking-wide">WhatsApp Conversion Rate</p>
              <p className="mt-1 text-2xl font-bold text-[#075E54]">
                {((waClicks / month.total) * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-gray-500">{waClicks} WA clicks / {month.total} page views this month</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
