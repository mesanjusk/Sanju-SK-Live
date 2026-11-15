import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaWhatsapp, FaLock, FaCheckCircle } from 'react-icons/fa';
import api from '../api';
import SEO from '../components/SEO';
import '../styles/pinterest-responsive-2026.css';

let razorpayLoader;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayLoader) {
    razorpayLoader = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => { razorpayLoader = null; reject(new Error('Unable to load secure checkout')); };
      document.body.appendChild(script);
    });
  }
  return razorpayLoader;
}
function findUnitPrice(product, quantity) {
  const tiers = Array.isArray(product?.quantityPricing) ? product.quantityPricing : [];
  if (tiers.length) {
    const tier = tiers.filter(item => quantity >= Number(item.minQty) &&
      (!item.maxQty || quantity <= Number(item.maxQty)))
      .sort((a,b)=>Number(b.minQty)-Number(a.minQty))[0];
    return tier && Number(tier.price)>0 ? Number(tier.price) : null;
  }
  return Number(product?.price)>0 ? Number(product.price) : null;
}
const safeNumber = value => Number.isSafeInteger(Number(value)) ? Number(value) : 0;

export default function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const productId = String(params.get('product') || '');
  const quantity = Math.min(100000,Math.max(1,safeNumber(params.get('qty') || location.state?.quantity || 1)));
  const initial = location.state?.product?._id === productId ? location.state.product : null;
  const [product,setProduct] = useState(initial);
  const [loading,setLoading] = useState(!initial);
  const [config,setConfig] = useState({upiEnabled:false});
  const [form,setForm] = useState({name:'',phone:'',address:'',instructions:''});
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  const [confirmation,setConfirmation] = useState(null);

  useEffect(()=>{
    let active=true;
    setLoading(true);
    setError('');
    Promise.allSettled([
      api.get('/api/listings/' + encodeURIComponent(productId),{timeout:18000}),
      api.get('/api/orders/config',{timeout:12000})
    ]).then(([catalog,settings])=>{
      if(!active)return;
      if(catalog.status==='fulfilled' && catalog.value.data?._id){
        setProduct(catalog.value.data);
      }else{
        setError('This product is temporarily unavailable. Please return to the gallery.');
        setProduct(null);
      }
      setConfig(settings.status==='fulfilled'?settings.value.data:{upiEnabled:false});
    }).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[productId]);

  const unitPrice = useMemo(()=>findUnitPrice(product,quantity),[product,quantity]);
  const subtotal = unitPrice ? Math.round(unitPrice*quantity*100)/100 : null;
  const waLink = 'https://wa.me/919372333633?text=' + encodeURIComponent(
    'Hi SANJU SK Digital, I want to order ' + (product?.title||'this design') +
    '\\nDesign: https://www.sanjusk.in/products/' + productId +
    '\\nQuantity: ' + quantity + '\\nPlease confirm price, artwork and delivery.');
  async function payNow(event) {
    event.preventDefault();
    if (busy || !config?.upiEnabled || !unitPrice) return;
    setBusy(true);setError('');
    try {
      if (!(await loadRazorpay())) throw new Error('Secure payment window unavailable');
      const response=await api.post('/api/orders/checkout',{
        productId,quantity,customer:{
          name:form.name.trim(),phone:form.phone.trim(),address:form.address.trim(),
          instructions:form.instructions.trim()
        }
      },{timeout:30000});
      const {gatewayOrderId,amountPaise,publicKey,orderRef}=response.data;
      if(!gatewayOrderId || !publicKey || !Number.isSafeInteger(amountPaise)) throw new Error('Checkout could not be started');
      const checkout=new window.Razorpay({
        key:publicKey,order_id:gatewayOrderId,amount:amountPaise,currency:'INR',
        name:'SANJU SK Digital',description:product.title + ' · ' + quantity + ' pcs',
        prefill:{name:form.name.trim(),contact:form.phone.trim()},
        theme:{color:'#e60023'},
        method:{upi:true},
        notes:{order_reference:orderRef},
        handler:async result=>{
          try {
            const verified=await api.post('/api/orders/verify',{
              razorpay_order_id:result.razorpay_order_id,
              razorpay_payment_id:result.razorpay_payment_id,
              razorpay_signature:result.razorpay_signature
            },{timeout:25000});
            if(verified.data?.verified && verified.data?.status==='paid'){
              setConfirmation(verified.data.orderRef);setError('');
            }else{
              setError('Payment is being confirmed. Please do not pay twice. Contact us with your payment ID.');
            }
          }catch{
            setError('Payment confirmation is pending. Do not pay again. Contact us with your payment reference.');
          }finally{setBusy(false);}
        },
        modal:{ondismiss:()=>setBusy(false)}
      });
      checkout.on('payment.failed',event=>{
        setBusy(false);setError(event?.error?.description || 'Payment failed. No order was confirmed.');
      });
      checkout.open();
    }catch(e){
      setBusy(false);
      setError(e.response?.data?.message || e.message || 'Unable to start UPI checkout.');
    }
  }
  if(confirmation)return <main className="sk-commerce-checkout">
    <SEO title="Order payment confirmed" pathname="/checkout" noIndex />
    <div className="sk-checkout-panel sk-checkout-success">
      <FaCheckCircle aria-hidden="true" />
      <h1>Payment verified</h1>
      <p>Thank you! We have received your order. Our team will contact you to confirm artwork and production details.</p>
      <p>Your reference: <strong>{confirmation}</strong></p>
      <Link to="/">Explore more designs</Link>
    </div>
  </main>;
  return <main className="sk-commerce-checkout">
    <SEO title="Secure UPI checkout" pathname="/checkout" noIndex />
    <header className="sk-checkout-header">
      <button type="button" aria-label="Back to design" onClick={()=>navigate(-1)}><FaArrowLeft/></button>
      <strong>Complete your order</strong><span><FaLock/> Secure checkout</span>
    </header>
    <div className="sk-checkout-layout">
      <section className="sk-checkout-panel">
        <h1>Buy this design</h1>
        {loading ? <p role="status">Loading the latest product details…</p> :
          product ? <div className="sk-checkout-product">
            {product.images?.[0] && <img src={product.images[0]} alt={product.title} />}
            <div><h2>{product.title}</h2><p>Quantity: {quantity} pcs</p>
              <p>{unitPrice ? 'Estimated total: ₹' + subtotal.toLocaleString('en-IN') : 'Price on request'}</p>
              <Link to={'/products/'+productId}>Change quantity or review design</Link>
            </div>
          </div> : <p>Product unavailable</p>}
        <p className="sk-checkout-note">Printed products are made to order. Final artwork approval, delivery charges and any customization requiring a revised quote must be agreed before production.</p>
      </section>
      <section className="sk-checkout-panel">
        <h2>Customer and delivery details</h2>
        {error && <p className="sk-checkout-error" role="alert">{error}</p>}
        <form onSubmit={payNow}>
          <label>Full name<input required maxLength="80" value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name" /></label>
          <label>Mobile number<input required type="tel" inputMode="numeric" pattern="[0-9]{10}"
            title="Enter your 10-digit Indian mobile number" maxLength="10" value={form.phone}
            onChange={e=>setForm({...form,phone:e.target.value.replace(/[^0-9]/g,'')})} autoComplete="tel-national" /></label>
          <label>Delivery address<textarea required rows="3" minLength="10" maxLength="500"
            value={form.address} onChange={e=>setForm({...form,address:e.target.value})}
            autoComplete="street-address" /></label>
          <label>Print / artwork instructions (optional)<textarea rows="2" maxLength="500"
            value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} /></label>
          {config?.upiEnabled && unitPrice ? <button className="sk-checkout-pay" type="submit" disabled={busy||loading}>
            {busy?'Opening secure payment…':'Pay ₹'+subtotal.toLocaleString('en-IN')+' by UPI'}
          </button> : <p className="sk-checkout-note" role="status">
            UPI payment is not active yet for this product. No payment will be collected here. Request a confirmed quotation on WhatsApp instead.
          </p>}
        </form>
        <a className="sk-checkout-whatsapp" href={waLink} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp/> Request quotation on WhatsApp</a>
        <p className="sk-checkout-note">Payments are confirmed only after verification by the payment provider. Never transfer money to an unverified account or QR code.</p>
      </section>
    </div>
  </main>;
}
