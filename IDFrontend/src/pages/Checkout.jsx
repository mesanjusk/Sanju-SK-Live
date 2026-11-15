import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaWhatsapp, FaLock, FaCheckCircle, FaChevronDown } from 'react-icons/fa';
import api from '../api';
import SEO from '../components/SEO';
import '../styles/pinterest-responsive-2026.css';

let razorpayLoader;
function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true);
  if (!razorpayLoader) {
    razorpayLoader = new Promise((resolve,reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(Boolean(window.Razorpay));
      script.onerror = () => {
        razorpayLoader = null;
        reject(new Error('Unable to load secure checkout'));
      };
      document.body.appendChild(script);
    });
  }
  return razorpayLoader;
}

export function sortedQuantityTiers(product) {
  return (Array.isArray(product?.quantityPricing) ? product.quantityPricing : [])
    .filter(t => Number(t.minQty)>0 && Number(t.price)>0)
    .sort((a,b)=>Number(a.minQty)-Number(b.minQty));
}
export function initialOrderQuantity(product) {
  return Math.max(1,Math.min(100000,Number(sortedQuantityTiers(product)[0]?.minQty)||1));
}
export function findUnitPrice(product,quantity) {
  if(!Number.isSafeInteger(quantity) || quantity<1 || quantity>100000)return null;
  const tiers=Array.isArray(product?.quantityPricing) ? product.quantityPricing : [];
  if(tiers.length){
    const matching=tiers.filter(t => quantity>=Number(t.minQty) &&
      (!t.maxQty || quantity<=Number(t.maxQty)))
      .sort((a,b)=>Number(b.minQty)-Number(a.minQty))[0];
    return matching && Number(matching.price)>0 ? Number(matching.price) : null;
  }
  return Number(product?.price)>0 ? Number(product.price) : null;
}

export default function Checkout() {
  const location=useLocation();
  const navigate=useNavigate();
  const [params]=useSearchParams();
  const productId=String(params.get('product')||'');
  const initial=String(location.state?.product?._id||'')===productId ? location.state.product : null;
  const queryQty=Number(params.get('qty')||location.state?.quantity);
  const hasValidQty=Number.isSafeInteger(queryQty)&&queryQty>=1&&queryQty<=100000;
  const [product,setProduct]=useState(initial);
  const [loading,setLoading]=useState(!initial);
  const [config,setConfig]=useState({upiEnabled:false});
  const [qty,setQty]=useState(() => String(hasValidQty?queryQty:initialOrderQuantity(initial)));
  const [quantityTouched,setQuantityTouched]=useState(hasValidQty);
  const [form,setForm]=useState({name:'',phone:'',address:'',instructions:''});
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [confirmation,setConfirmation]=useState(null);

  useEffect(()=>{
    let active=true;
    setLoading(!initial);
    setError('');
    Promise.allSettled([
      api.get('/api/listings/'+encodeURIComponent(productId),{timeout:18000}),
      api.get('/api/orders/config',{timeout:12000})
    ]).then(([catalog,settings])=>{
      if(!active)return;
      if(catalog.status==='fulfilled' && String(catalog.value.data?._id||'')===productId){
        setProduct(catalog.value.data);
      } else if(!initial) {
        setProduct(null);
        setError('This design is temporarily unavailable. Please return to the gallery.');
      }
      setConfig(settings.status==='fulfilled'?settings.value.data:{upiEnabled:false});
    }).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[productId]);

  useEffect(()=>{
    if(product&&!quantityTouched)setQty(String(initialOrderQuantity(product)));
  },[product,quantityTouched]);

  const quantity=Number(qty);
  const validQuantity=Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=100000;
  const tiers=useMemo(()=>sortedQuantityTiers(product),[product]);
  const unitPrice=useMemo(()=>validQuantity?findUnitPrice(product,quantity):null,
    [product,quantity,validQuantity]);
  const subtotal=unitPrice!==null?Math.round(unitPrice*quantity*100)/100:null;
  const waLink='https://wa.me/919372333633?text='+encodeURIComponent(
    'Hi SANJU SK Digital, please quote for '+(product?.title||'this design')+
    '\nDesign: https://www.sanjusk.in/products/'+productId+
    '\nQuantity: '+(validQuantity?quantity:'Please confirm')+
    (form.name.trim()?'\nName: '+form.name.trim():'')+
    (form.instructions.trim()?'\nArtwork instructions: '+form.instructions.trim():'')+
    '\nPlease confirm final price, artwork and delivery.');

  const selectQuantity = value => {
    const next=Math.min(100000,Math.max(1,Number(value)||1));
    setQuantityTouched(true);
    setQty(String(next));
  };

  async function payNow(event) {
    event.preventDefault();
    if(busy || !config?.upiEnabled || unitPrice===null || !validQuantity || !product)return;
    setBusy(true);setError('');
    try {
      if(!(await loadRazorpay()))throw new Error('Secure payment window unavailable');
      const response=await api.post('/api/orders/checkout',{
        productId,quantity,
        customer:{
          name:form.name.trim(),phone:form.phone.trim(),address:form.address.trim(),
          instructions:form.instructions.trim()
        }
      },{timeout:30000});
      const {gatewayOrderId,amountPaise,publicKey,orderRef}=response.data;
      if(!gatewayOrderId || !publicKey || !Number.isSafeInteger(amountPaise))
        throw new Error('Checkout could not be started');
      // Server catalog is authoritative. Do not charge a different amount than shown.
      if(amountPaise!==Math.round(subtotal*100)){
        throw new Error('The price has changed. Please reload checkout before paying.');
      }
      const payment=new window.Razorpay({
        key:publicKey,order_id:gatewayOrderId,amount:amountPaise,currency:'INR',
        name:'SANJU SK Digital',description:product.title+' · '+quantity+' pcs',
        prefill:{name:form.name.trim(),contact:form.phone.trim()},
        theme:{color:'#e60023'},method:{upi:true},notes:{order_reference:orderRef},
        handler:async result=>{
          try{
            const verified=await api.post('/api/orders/verify',{
              razorpay_order_id:result.razorpay_order_id,
              razorpay_payment_id:result.razorpay_payment_id,
              razorpay_signature:result.razorpay_signature
            },{timeout:25000});
            if(verified.data?.verified && verified.data?.status==='paid'){
              setConfirmation(verified.data.orderRef);setError('');
            }else{
              setError('Payment confirmation is pending. Please do not pay again. Contact us with your payment ID.');
            }
          }catch{
            setError('Payment confirmation is pending. Do not pay again. Contact us with your payment reference.');
          }finally{setBusy(false);}
        },
        modal:{ondismiss:()=>setBusy(false)}
      });
      payment.on('payment.failed',e=>{
        setBusy(false);
        setError(e?.error?.description||'Payment failed. No order was confirmed.');
      });
      payment.open();
    }catch(e){
      setBusy(false);
      setError(e.response?.data?.message || e.message || 'Unable to start UPI checkout.');
    }
  }

  if(confirmation)return <main className="sk-commerce-checkout sk-commerce-checkout-compact">
    <SEO title="Order payment confirmed" pathname="/checkout" noIndex />
    <div className="sk-checkout-panel sk-checkout-success">
      <FaCheckCircle aria-hidden="true"/>
      <h1>Payment verified</h1>
      <p>Thank you! Our team will contact you to confirm artwork and production details.</p>
      <p>Reference: <strong>{confirmation}</strong></p>
      <Link to="/">Explore more designs</Link>
    </div>
  </main>;

  return <main className="sk-commerce-checkout sk-commerce-checkout-compact">
    <SEO title="Buy custom design" pathname="/checkout" noIndex />
    <header className="sk-checkout-header">
      <button type="button" aria-label="Back to design" onClick={()=>navigate(-1)}><FaArrowLeft/></button>
      <strong>Buy now</strong><span><FaLock/> Secure checkout</span>
    </header>
    <div className="sk-checkout-layout">
      <section className="sk-checkout-panel sk-checkout-order">
        {product ? <div className="sk-checkout-product">
          {product.images?.[0] &&
            <img src={product.images[0]} alt={product.title} loading="eager"/>}
          <div>
            <h1>{product.title}</h1>
            <p>Custom-made by SANJU SK Digital</p>
          </div>
        </div> : <p role="status">{loading?'Loading design…':'Product unavailable'}</p>}
        {product && <div className="sk-checkout-quantity">
          <h2>Choose quantity</h2>
          {tiers.length>0 && <div className="sk-checkout-quantity-tiers">
            {tiers.map((tier,i)=>{
              const chosen=validQuantity&&quantity>=Number(tier.minQty)&&
                (!tier.maxQty||quantity<=Number(tier.maxQty));
              return <button type="button" key={tier.minQty+'-'+i}
                className={chosen?'is-current':''} aria-pressed={chosen}
                onClick={()=>selectQuantity(tier.minQty)}>
                {tier.minQty}{tier.maxQty?'–'+tier.maxQty:'+'} pcs
              </button>;
            })}
          </div>}
          <label className="sk-checkout-quantity-input">Pieces
            <input type="number" inputMode="numeric" min="1" max="100000" step="1"
              value={qty} onChange={event=>{setQuantityTouched(true);setQty(event.target.value);}}
              onBlur={()=>{if(!validQuantity)selectQuantity(initialOrderQuantity(product));}}/>
          </label>
          <div className="sk-checkout-total" aria-live="polite">
            <span>{unitPrice!==null?'₹'+unitPrice.toLocaleString('en-IN')+' / piece':
              'Price on request'}</span>
            {subtotal!==null && <strong>₹{subtotal.toLocaleString('en-IN')}</strong>}
          </div>
          <details className="sk-checkout-extra">
            <summary>Design details <FaChevronDown aria-hidden="true"/></summary>
            {product.description&&<p>{product.description}</p>}
            {product.size&&<p>Size: {String(product.size)}</p>}
            {product.badge&&<p>{String(product.badge)}</p>}
            {product.religions&&<p>{String(product.religions)}</p>}
          </details>
        </div>}
      </section>

      <section className="sk-checkout-panel sk-checkout-customer">
        <h2>Your details</h2>
        {error&&<p className="sk-checkout-error" role="alert">{error}</p>}
        <form onSubmit={payNow}>
          <label>Full name<input required maxLength="80" value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})} autoComplete="name"
            placeholder="Your name"/></label>
          <label>Mobile number<input required type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}"
            title="Enter a valid 10-digit Indian mobile number" maxLength="10" value={form.phone}
            onChange={e=>setForm({...form,phone:e.target.value.replace(/[^0-9]/g,'')})}
            autoComplete="tel-national" placeholder="10-digit mobile number"/></label>
          {config?.upiEnabled && <label>Delivery address<textarea required rows="2" minLength="10"
            maxLength="500" value={form.address} onChange={e=>setForm({...form,address:e.target.value})}
            autoComplete="street-address" placeholder="Full address for delivery"/></label>}
          <details className="sk-checkout-extra">
            <summary>Artwork instructions (optional) <FaChevronDown aria-hidden="true"/></summary>
            <textarea rows="2" maxLength="500" aria-label="Artwork instructions"
              placeholder="Text, colors or customization details"
              value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})}/>
          </details>
          {config?.upiEnabled && unitPrice!==null && validQuantity && product ?
            <button className="sk-checkout-pay" type="submit" disabled={busy||loading}>
              {busy?'Opening secure payment…':'Pay ₹'+subtotal.toLocaleString('en-IN')+' by UPI'}
            </button>:
            <p className="sk-checkout-note" role="status">
              UPI checkout is currently unavailable{unitPrice===null?' for this quantity':''}.
              Request a confirmed quotation below. No payment is collected here.
            </p>}
        </form>
        <a className="sk-checkout-whatsapp" href={waLink} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp/> Request quotation on WhatsApp
        </a>
        <p className="sk-checkout-note">
          Custom artwork, final price and delivery are confirmed before production.
          Payment is accepted only after provider verification.
        </p>
      </section>
    </div>
  </main>;
}
