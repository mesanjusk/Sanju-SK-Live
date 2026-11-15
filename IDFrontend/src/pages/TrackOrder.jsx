import {useEffect,useState} from 'react';
import {Link,useLocation} from 'react-router-dom';
import {FaArrowLeft,FaCheckCircle,FaWhatsapp} from 'react-icons/fa';
import api from '../api';
import SEO from '../components/SEO';
import '../styles/pinterest-responsive-2026.css';

const headings={
  new_order:'Order received',design_in_progress:'Artwork being prepared',
  awaiting_approval:'Waiting for your artwork approval',
  ready_for_print:'Approved for printing',in_print:'Printing in progress',
  post_print:'Finishing and packing',ready:'Ready for delivery',
  delivered:'Delivered',on_hold:'Order on hold',cancelled:'Order cancelled'
};
const labels={
  pending_quote:'Quotation requested',quoted:'Quotation prepared',
  pending_payment:'Payment awaiting verification',paid:'Online payment verified',refunded:'Refunded'
};
function hashData(hash){
  const raw=String(hash||'').replace(/^#/,'');
  const match=raw.match(/^([a-f\d]{24})\.([a-f\d]{64})$/i);
  return match?{orderRef:match[1],trackingToken:match[2]}:null;
}
export default function TrackOrder(){
  const location=useLocation();
  const fromLink=hashData(location.hash);
  const [reference,setReference]=useState(fromLink?.orderRef||'');
  const [token,setToken]=useState(fromLink?.trackingToken||'');
  const [order,setOrder]=useState(null);
  const [loading,setLoading]=useState(false),[error,setError]=useState('');
  const [note,setNote]=useState(''),[sending,setSending]=useState(false);
  async function refresh(ref=reference,secret=token){
    setLoading(true);setError('');
    try{
      const {data}=await api.post('/api/orders/track',
        {orderRef:ref.trim(),trackingToken:secret.trim()},{timeout:16000});
      setOrder(data.order);
    }catch(e){setOrder(null);setError(e.response?.data?.message||'Cannot load this order. Check your tracking details.');}
    finally{setLoading(false);}
  }
  useEffect(()=>{
    if(fromLink)refresh(fromLink.orderRef,fromLink.trackingToken);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[location.hash]);
  async function decide(decision){
    setSending(true);setError('');
    try{
      await api.post('/api/orders/artwork-decision',{
        orderRef:reference.trim(),trackingToken:token.trim(),decision,note
      },{timeout:16000});
      setNote('');await refresh();
    }catch(e){setError(e.response?.data?.message||'Could not save your artwork decision.');}
    finally{setSending(false);}
  }
  const wa='https://wa.me/919372333633?text='+encodeURIComponent(
    'Hi SANJU SK Digital, please help with my order '+reference);
  return <main className="sk-order-tracking sk-public-site">
    <SEO title="Track custom printing order" pathname="/track-order" noIndex/>
    <div className="sk-tracking-content">
      <header className="sk-checkout-header">
        <Link to="/" aria-label="Back to gallery"><FaArrowLeft/></Link>
        <strong>Track your order</strong>
      </header>
      <section className="sk-checkout-panel">
        <h1>Order progress</h1>
        <p className="sk-tracking-help">Keep your tracking key private. Only you and people you share it with can view this order and approve artwork.</p>
        <form onSubmit={e=>{e.preventDefault();refresh();}} className="sk-tracking-form">
          <label>Order reference
            <input required pattern="[a-fA-F0-9]{24}" value={reference} autoComplete="off"
              onChange={e=>setReference(e.target.value)} placeholder="24-character order ID"/>
          </label>
          <label>Private tracking key
            <input required pattern="[a-fA-F0-9]{64}" value={token} autoComplete="off"
              onChange={e=>setToken(e.target.value)} placeholder="64-character key"/>
          </label>
          <button type="submit" className="sk-checkout-pay" disabled={loading}>
            {loading?'Checking…':'Check status'}
          </button>
        </form>
        {error&&<p role="alert" className="sk-checkout-error">{error}</p>}
      </section>
      {order&&<section className="sk-checkout-panel sk-tracking-status">
        <span className="sk-tracking-tag">{labels[order.paymentStatus]||'Order in progress'}</span>
        <h2>{headings[order.workflowStatus]||'Order in progress'}</h2>
        <p>{order.title} · {order.quantity} pcs</p>
        <p><strong>Artwork:</strong> {(order.artworkStatus||'').replaceAll('_',' ')}</p>
        <p><strong>Delivery:</strong> {(order.deliveryStatus||'').replaceAll('_',' ')}</p>
        {order.trackingNumber&&<p>Courier tracking: {order.trackingNumber}</p>}
        {order.artworkPreviewUrl&&<div className="sk-tracking-proof">
          <h3>Artwork preview</h3>
          <a href={order.artworkPreviewUrl} target="_blank" rel="noopener noreferrer">
            <img src={order.artworkPreviewUrl} alt="Your order artwork preview" loading="lazy"/>
          </a>
          {order.artworkStatus==='awaiting_approval'&&<>
            <p>Please review the artwork carefully before approving it for production.</p>
            <label>Changes required (optional)<textarea rows="2" maxLength="300"
              value={note} onChange={e=>setNote(e.target.value)}
              placeholder="Any corrections?"/></label>
            <div className="sk-tracking-approve-buttons">
              <button type="button" disabled={sending} onClick={()=>decide('approve')}>
                <FaCheckCircle/> Approve artwork
              </button>
              <button type="button" disabled={sending} onClick={()=>decide('request_changes')}>
                Request corrections
              </button>
            </div>
          </>}
        </div>}
        <h3>Recent updates</h3>
        <ol className="sk-tracking-history">
          {(order.history||[]).slice().reverse().map((h,i)=><li key={i}>
            <strong>{h.event.replaceAll('_',' ')}</strong>
            <small>{new Date(h.createdAt).toLocaleString('en-IN')}</small>
            {h.note&&<p>{h.note}</p>}
          </li>)}
        </ol>
      </section>}
      <a href={wa} target="_blank" rel="noopener noreferrer" className="sk-checkout-whatsapp">
        <FaWhatsapp/> Ask the studio about this order
      </a>
    </div>
  </main>;
}
