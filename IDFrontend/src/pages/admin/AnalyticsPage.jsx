import {useCallback,useEffect,useState} from 'react';
import {
  FaChartLine,FaUsers,FaEye,FaShoppingBag,FaWhatsapp,FaDownload,
  FaMobileAlt,FaFilter,FaSyncAlt
} from 'react-icons/fa';
import api from '../../api';

const num=n=>Number(n||0).toLocaleString('en-IN');
const money=paise=>'₹'+(Number(paise||0)/100).toLocaleString('en-IN',{
  minimumFractionDigits:0,maximumFractionDigits:2});
function Metric({title,value,detail,Icon}){
  return <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-3">
      <span className="text-xs font-semibold text-gray-500">{title}</span>
      <Icon className="text-gray-600" aria-hidden="true"/>
    </div>
    <div className="text-2xl font-extrabold tracking-tight text-[#222]">{value}</div>
    {detail&&<p className="mt-1 text-xs text-gray-500">{detail}</p>}
  </section>;
}
function Ranking({title,rows=[],empty='No data collected yet',note='',getLabel,getValue}){
  const safeRows=(rows||[]).slice(0,12);
  const max=Math.max(1,...safeRows.map(r=>Number(getValue?getValue(r):r.views)||0));
  return <section className="min-w-0 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
    <h3 className="mb-1 text-base font-extrabold text-[#222]">{title}</h3>
    {note&&<p className="mb-3 text-xs text-gray-500">{note}</p>}
    {safeRows.length===0?<p className="mt-3 text-xs text-gray-500">{empty}</p>:
      <div className="space-y-3">
        {safeRows.map((r,i)=>{
          const n=Number(getValue?getValue(r):r.views)||0;
          const label=getLabel?getLabel(r):r.label;
          return <div key={label+'-'+i}>
            <div className="mb-1 flex justify-between gap-3 text-xs">
              <span className="min-w-0 truncate text-gray-700" title={label}>{label||'Unknown'}</span>
              <b className="shrink-0 text-gray-900">{num(n)}</b>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-[#e60023]" style={{width:(n/max*100)+'%'}}/>
            </div>
          </div>;
        })}
      </div>}
  </section>;
}
function Funnel({events={},paidOrders=0}){
  const stages=[
    ['Landing and other page views',events.pageview||0],
    ['Product details viewed',events.product_view||0],
    ['Checkouts opened',events.checkout_start||0],
    ['Quote forms submitted',events.quote_request||0],
    ['WhatsApp contact taps',events.whatsapp_click||0]
  ];
  const max=Math.max(1,...stages.map(x=>x[1]));
  return <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
    <h3 className="mb-1 text-base font-extrabold text-[#222]">Customer journey</h3>
    <p className="mb-4 text-xs text-gray-500">
      Opted-in event counts, not unique shoppers. Stages may include repeated actions.
    </p>
    <div className="space-y-3">
      {stages.map(([label,value])=><div key={label}>
        <div className="mb-1 flex justify-between gap-2 text-xs text-gray-700">
          <span>{label}</span><strong>{num(value)}</strong>
        </div>
        <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
          <div style={{width:Math.max(value?2:0,100*value/max)+'%'}}
            className="h-full rounded-full bg-[#e60023]"/>
        </div>
      </div>)}
    </div>
    <p className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-600">
      Verified paid orders from the order database: <strong>{num(paidOrders)}</strong>.
      These are not inferred from clicks.
    </p>
  </section>;
}
function Trend({data=[]}){
  const recent=data.slice(-30);
  const max=Math.max(1,...recent.map(v=>v.views||0));
  return <section className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5">
    <h3 className="mb-1 text-base font-extrabold text-[#222]">Daily traffic</h3>
    <p className="mb-4 text-xs text-gray-500">
      Last {recent.length} recorded days, based on consented page views (India time)
    </p>
    {recent.length===0?<p className="text-xs text-gray-500">No visits yet</p>:
    <div className="overflow-x-auto">
      <div className="flex h-40 min-w-[320px] items-end gap-1 border-b border-gray-200 pb-1">
        {recent.map(d=><div key={d.date} className="group flex min-w-[6px] flex-1 flex-col items-center justify-end"
          title={d.date+' · '+num(d.views)+' views'}>
          <div className="w-full min-w-[4px] rounded-t bg-[#e60023]"
            style={{height:Math.max(3,d.views/max*130)+'px'}}/>
        </div>)}
      </div>
      <div className="flex justify-between gap-2 pt-2 text-[10px] text-gray-500">
        <span>{recent[0]?.date}</span><span>{recent.at(-1)?.date}</span>
      </div>
    </div>}
  </section>;
}
function exportReport(data){
  if(!data)return;
  const rows=[['SK Digital business analytics summary',''],
    ['Period days',data.days],['Pageviews',data.totals?.views],
    ['Anonymous browsers',data.totals?.visitors],
    ['Anonymous sessions',data.totals?.sessions],
    ['Verified paid orders',data.commerce?.paidOrders],
    ['Verified gross INR',Number(data.commerce?.verifiedGrossPaise||0)/100],
    ['Recorded refunds INR',Number(data.commerce?.recordedRefundPaise||0)/100],
    ['',''],['Day','Page views'],
    ...(data.daily||[]).map(x=>[x.date,x.views]),
    ['',''],['Traffic source','Page views'],
    ...(data.sources||[]).map(x=>[x.label,x.views]),
    ['',''],['Campaign','Page views'],
    ...(data.campaigns||[]).map(x=>[x.label,x.views]),
    ['',''],['Top products','Views'],
    ...(data.topProducts||[]).map(x=>[x.title,x.views])];
  const csv=rows.map(row=>row.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const link=document.createElement('a');
  link.href=url;link.download='sk-digital-growth-'+data.days+'-days.csv';
  document.body.appendChild(link);link.click();link.remove();URL.revokeObjectURL(url);
}
export default function AnalyticsPage(){
  const [days,setDays]=useState(30),[data,setData]=useState(null);
  const [loading,setLoading]=useState(true),[error,setError]=useState('');
  const refresh=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const response=await api.get('/api/analytics/insights',{params:{days},timeout:30000});
      setData(response.data);
    }catch(e){
      setData(null);
      setError(e.response?.status===404
        ?'The analytics dashboard is deployed, but its backend upgrade is not active on Render.'
        :'Unable to load growth reports. Check backend deployment and administrator permissions.');
    }finally{setLoading(false);}
  },[days]);
  useEffect(()=>{refresh();},[refresh]);
  const events=data?.totals?.events||{},commerce=data?.commerce||{};
  return <div className="mx-auto w-full max-w-7xl pb-12">
    <header className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-2xl font-extrabold text-[#222]">Business growth analytics</h2>
        <p className="mt-1 text-xs text-gray-500">
          Acquisition, top designs, shopping funnel, devices and verified order results.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <label className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3">
          <FaFilter className="text-gray-500"/>
          <select className="bg-white py-2.5 text-xs font-semibold" aria-label="Reporting period"
            value={days} onChange={e=>setDays(Number(e.target.value))}>
            {[7,30,90].map(n=><option key={n} value={n}>Last {n} days</option>)}
          </select>
        </label>
        <button type="button" onClick={refresh} disabled={loading}
          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2.5 text-xs font-semibold text-[#222]">
          <FaSyncAlt/> Refresh
        </button>
        <button type="button" disabled={!data} onClick={()=>exportReport(data)}
          className="inline-flex items-center gap-2 rounded-full bg-[#202020] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">
          <FaDownload/> CSV
        </button>
      </div>
    </header>
    {error&&<div role="alert" className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">
      {error}
    </div>}
    {loading?<div role="status" className="rounded-xl border border-gray-200 bg-white p-8 text-sm text-gray-500">Loading analytics…</div>:null}
    {data&&<div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Metric title="Anonymous browsers" value={num(data.totals?.visitors)}
          Icon={FaUsers} detail="Consented browser IDs, not individual people"/>
        <Metric title="Sessions" value={num(data.totals?.sessions)}
          Icon={FaChartLine} detail="Anonymous browser sessions"/>
        <Metric title="Pageviews" value={num(data.totals?.views)}
          Icon={FaEye} detail="Tracked public pages"/>
        <Metric title="Product interest" value={num(events.product_view)}
          Icon={FaShoppingBag} detail="Design detail views"/>
        <Metric title="Quote orders" value={num(commerce.quoteRequests)}
          Icon={FaShoppingBag} detail="Stored in the business order database"/>
        <Metric title="Verified online orders" value={num(commerce.paidOrders)}
          Icon={FaShoppingBag} detail="Razorpay confirmed, not click estimates"/>
        <Metric title="Verified gross amount" value={money(commerce.verifiedGrossPaise)}
          Icon={FaChartLine} detail="Before recorded refunds"/>
        <Metric title="WhatsApp taps" value={num(events.whatsapp_click)}
          Icon={FaWhatsapp} detail="Consented site events only"/>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Trend data={data.daily}/>
        <Funnel events={events} paidOrders={commerce.paidOrders}/>
        <Ranking title="Traffic acquisition" rows={data.sources}
          note="Campaign sources, social referrals, search engines and direct traffic"/>
        <Ranking title="Landing campaigns" rows={data.campaigns}
          note="Campaigns populated by UTM tagging"/>
        <Ranking title="Search / campaign keywords" rows={data.keywords}
          note="Only sanitized opted-in terms where provided"/>
        <Ranking title="Most viewed designs" rows={data.topProducts}
          getLabel={row=>row.title} note="Find products worth promoting or stocking"/>
        <Ranking title="Categories people explore" rows={data.categories}
          note="Customer browsing demand by category"/>
        <Ranking title="Popular pages" rows={data.topPages}
          note="Find where shoppers spend their attention"/>
        <Ranking title="Device mix" rows={data.devices} note="Mobile, desktop and tablet"/>
        <Ranking title="Browser mix" rows={data.browsers} note="Chrome, Safari, Edge and others"/>
        <Ranking title="Operating system" rows={data.operatingSystems}/>
        <Ranking title="Connection quality" rows={data.networks}
          note="2G/3G/4G hints when available — not network identities"/>
        <Ranking title="Visitor countries" rows={data.countries}
          note="Only if trusted coarse geo headers are configured"/>
        <Ranking title="Channel type" rows={data.mediums}
          note="Organic, social, referral, paid UTM and direct"/>
      </div>
      <section className="rounded-2xl border border-gray-200 bg-white p-4 text-xs leading-relaxed text-gray-600">
        <h3 className="mb-2 text-sm font-bold text-[#222]">How to use this for growth</h3>
        <p>Compare product demand with quote orders, invest more in campaigns that bring
          qualified visitors, improve mobile checkout when mobile dominates, and track
          whether design views become enquiries. Return visits are identified only on
          browsers that consented; analytics data expires after {data.retentionDays} days.</p>
        <p className="mt-2">Recorded refunds: {money(commerce.recordedRefundPaise)}.
          Fully refunded orders: {num(commerce.fullyRefundedOrders)}.
          Counts may exclude visitors who decline analytics or use privacy controls.
          We do not collect raw network IP addresses, hardware IDs or device fingerprints.</p>
      </section>
    </div>}
  </div>;
}
