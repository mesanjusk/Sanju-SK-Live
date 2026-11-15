import {useEffect,useMemo,useState} from 'react';
import {Link,useLocation,useNavigate,useSearchParams} from 'react-router-dom';
import {FaArrowLeft,FaWhatsapp,FaLock,FaCheckCircle,FaChevronDown} from 'react-icons/fa';
import api from '../api';
import SEO from '../components/SEO';
import '../styles/pinterest-responsive-2026.css';

let razorpayLoader;
function loadRazorpay(){
  if(window.Razorpay)return Promise.resolve(true);
  if(!razorpayLoader)razorpayLoader=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://checkout.razorpay.com/v1/checkout.js';
    script.async=true;
    script.onload=()=>resolve(Boolean(window.Razorpay));
    script.onerror=()=>{razorpayLoader=null;reject(new Error('Secure payment window could not load'));};
    document.body.appendChild(script);
  });
  return razorpayLoader;
}
export function sortedQuantityTiers(product){
  return (Array.isArray(product?.quantityPricing)?product.quantityPricing:[])
    .filter(t=>Number(t.minQty)>0&&Number(t.price)>0)
    .sort((a,b)=>Number(a.minQty)-Number(b.minQty));
}
export function initialOrderQuantity(product){
  return Math.max(1,Math.min(100000,Number(sortedQuantityTiers(product)[0]?.minQty)||1));
}
export function findUnitPrice(product,quantity){
  if(!Number.isSafeInteger(quantity)||quantity<1||quantity>100000)return null;
  const tiers=Array.isArray(product?.quantityPricing)?product.quantityPricing:[];
  if(tiers.length){
    const match=tiers.filter(t=>quantity>=Number(t.minQty)&&
      (!t.maxQty||quantity<=Number(t.maxQty)))
      .sort((a,b)=>Number(b.minQty)-Number(a.minQty))[0];
    return match&&Number(match.price)>0?Number(match.price):null;
  }
  return Number(product?.price)>0?Number(product.price):null;
}
const rupees=paise=>'₹'+(Number(paise||0)/100).toLocaleString('en-IN',{maximumFractionDigits:2});
const trackUrl=(ref,token)=>'/track-order#'+ref+'.'+token;

export default function Checkout(){
  const location=useLocation(),navigate=useNavigate(),[params]=useSearchParams();
  const productId=String(params.get('product')||'');
  const initial=String(location.state?.product?._id||'')===productId?location.state.product:null;
  const q=Number(params.get('qty')||location.state?.quantity);
  const hasQueryQty=Number.isSafeInteger(q)&&q>=1&&q<=100000;
  const [product,setProduct]=useState(initial);
  const [loading,setLoading]=useState(!initial);
  const [config,setConfig]=useState({upiEnabled:false,pricingConfigured:false});
  const [qty,setQty]=useState(()=>String(hasQueryQty?q:initialOrderQuantity(initial)));
  const [quantityTouched,setQuantityTouched]=useState(hasQueryQty);
  const [estimate,setEstimate]=useState(null);
  const [estimateLoading,setEstimateLoading]=useState(false);
  const [form,setForm]=useState({name:'',phone:'',address:'',instructions:''});
  const [custom,setCustom]=useState({size:'',material:'',deadline:'',artworkNotes:''});
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[completion,setCompletion]=useState(null);

  useEffect(()=>{
    let active=true;
    setLoading(!initial);setError('');
    Promise.allSettled([
      api.get('/api/listings/'+encodeURIComponent(productId),{timeout:18000}),
      api.get('/api/orders/config',{timeout:12000})
    ]).then(([listing,settings])=>{
      if(!active)return;
      if(listing.status==='fulfilled'&&String(listing.value.data?._id||'')===productId)
        setProduct(listing.value.data);
      else if(!initial){setProduct(null);setError('This design is temporarily unavailable.');}
      if(settings.status==='fulfilled')setConfig(settings.value.data);
    }).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[productId]);
  useEffect(()=>{
    if(product&&!quantityTouched)setQty(String(initialOrderQuantity(product)));
  },[product,quantityTouched]);

  const quantity=Number(qty);
  const validQuantity=Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=100000;
  const tiers=useMemo(()=>sortedQuantityTiers(product),[product]);
  const unitPrice=useMemo(()=>validQuantity?findUnitPrice(product,quantity):null,
    [product,quantity,validQuantity]);
  const estimatedBasePaise=unitPrice!==null?Math.round(unitPrice*quantity*100):null;
  useEffect(()=>{
    setEstimate(null);
    if(!product||!validQuantity)return undefined;
    let active=true;
    const controller=new AbortController();
    const timeout=window.setTimeout(async()=>{
      setEstimateLoading(true);
      try{
        const r=await api.get('/api/orders/estimate',{
          params:{productId,quantity},signal:controller.signal,timeout:12000
        });
        if(active&&r.data?.quantity===quantity)setEstimate(r.data);
      }catch{/* Older backend means quote-only; never guess tax/delivery for UPI. */}
      finally{if(active)setEstimateLoading(false);}
    },280);
    return()=>{active=false;controller.abort();window.clearTimeout(timeout);};
  },[productId,quantity,validQuantity,product]);

  const accurateTotal=estimate&&!estimate.needsQuote&&estimate.quantity===quantity&&
    Number.isSafeInteger(estimate.totalPaise)?estimate.totalPaise:null;
  const upiAvailable=Boolean(config.upiEnabled&&accurateTotal!==null);
  const waLink='https://wa.me/919372333633?text='+encodeURIComponent(
    'Hi SANJU SK Digital, please quote for '+(product?.title||'this design')+
    '\nDesign: https://www.sanjusk.in/products/'+productId+
    '\nQuantity: '+(validQuantity?quantity:'Please confirm')+
    (form.name.trim()?'\nName: '+form.name.trim():'')+
    (form.phone.trim()?'\nMobile: '+form.phone.trim():'')+
    (custom.size?'\nSize: '+custom.size:'')+
    (custom.material?'\nMaterial: '+custom.material:'')+
    (custom.artworkNotes?'\nArtwork: '+custom.artworkNotes:'')+
    '\nPlease confirm final price, artwork and delivery.');

  const selectQuantity=value=>{setQuantityTouched(true);setQty(String(Math.max(1,Math.min(100000,Number(value)||1))));};
  const buyer={...form,name:form.name.trim(),phone:form.phone.trim(),address:form.address.trim()};
  const customization={...custom,artworkNotes:[custom.artworkNotes,form.instructions].filter(Boolean).join(' · ').slice(0,500)};

  async function saveEnquiry(){
    if(!product||!validQuantity)throw Error('Select a valid design and quantity.');
    const r=await api.post('/api/orders/enquiries',
      {productId,quantity,customer:buyer,customization},{timeout:25000});
    if(!r.data?.orderRef||!r.data?.trackingToken)throw Error('Order reference missing.');
    setCompletion({kind:'quote',ref:r.data.orderRef,token:r.data.trackingToken});
  }
  async function submit(event){
    event.preventDefault();
    if(busy)return;
    setBusy(true);setError('');
    try{
      if(!upiAvailable){
        await saveEnquiry();
        return;
      }
      if(!buyer.address||buyer.address.length<10){
        throw Error('Enter your delivery address for online payment.');
      }
      if(!(await loadRazorpay()))throw Error('Secure checkout could not load.');
      const {data}=await api.post('/api/orders/checkout',
        {productId,quantity,customer:buyer,customization},{timeout:30000});
      const {gatewayOrderId,amountPaise,publicKey,orderRef,trackingToken}=data;
      if(!gatewayOrderId||!publicKey||!Number.isSafeInteger(amountPaise)||
        amountPaise!==accurateTotal)throw Error('Price changed. Reload checkout before paying.');
      const razorpay=new window.Razorpay({
        key:publicKey,order_id:gatewayOrderId,amount:amountPaise,currency:'INR',
        name:'SANJU SK Digital',description:product.title+' · '+quantity+' pcs',
        prefill:{name:buyer.name,contact:buyer.phone},theme:{color:'#e60023'},
        method:{upi:true},notes:{order_reference:orderRef},
        handler:async details=>{
          try{
            const confirm=await api.post('/api/orders/verify',{
              razorpay_order_id:details.razorpay_order_id,
              razorpay_payment_id:details.razorpay_payment_id,
              razorpay_signature:details.razorpay_signature
            },{timeout:25000});
            if(confirm.data?.verified&&confirm.data?.status==='paid'){
              setCompletion({kind:'paid',ref:orderRef,token:trackingToken});setError('');
            }else setError('Payment is pending verification. Do not pay twice. Contact us with your payment reference.');
          }catch{
            setError('Payment is pending confirmation. Do not pay again; contact the studio.');
          }finally{setBusy(false);}
        },
        modal:{ondismiss:()=>setBusy(false)}
      });
      razorpay.on('payment.failed',e=>{
        setBusy(false);setError(e?.error?.description||'Payment failed; no order marked paid.');
      });
      razorpay.open();
    }catch(e){
      setError(e.response?.data?.message||e.message||
        'Could not submit your order. Use WhatsApp as a fallback.');
      setBusy(false);
    }
  }
  if(completion)return <main className="sk-commerce-checkout sk-commerce-checkout-compact">
    <SEO title="Order request received" pathname="/checkout" noIndex/>
    <section className="sk-checkout-panel sk-checkout-success">
      <FaCheckCircle aria-hidden="true"/>
      <h1>{completion.kind==='paid'?'Payment verified':'Quotation request received'}</h1>
      <p>{completion.kind==='paid'?'Your payment is verified. Artwork approval is next.':
        'Your request is saved. We will confirm pricing and artwork before production.'}</p>
      <p>Order reference: <strong>{completion.ref}</strong></p>
      <p>Keep this private tracking link — anyone who has it can check your order and approve artwork.</p>
      <Link to={trackUrl(completion.ref,completion.token)}>Track order & artwork</Link>
      <Link to="/">More designs</Link>
    </section>
  </main>;
  return <main className="sk-commerce-checkout sk-commerce-checkout-compact">
    <SEO title="Buy custom design" pathname="/checkout" noIndex/>
    <header className="sk-checkout-header">
      <button type="button" aria-label="Back to design" onClick={()=>navigate(-1)}><FaArrowLeft/></button>
      <strong>Buy now</strong><span><FaLock/> Verified checkout</span>
    </header>
    <div className="sk-checkout-layout">
      <section className="sk-checkout-panel sk-checkout-order">
        {product?<div className="sk-checkout-product">
          {product.images?.[0]&&<img src={product.images[0]} alt={product.title} loading="eager"/>}
          <div><h1>{product.title}</h1><p>Custom-made by SANJU SK Digital</p></div>
        </div>:<p role="status">{loading?'Loading design…':'Design unavailable'}</p>}
        {product&&<div className="sk-checkout-quantity">
          <h2>Choose quantity</h2>
          {tiers.length>0&&<div className="sk-checkout-quantity-tiers">
            {tiers.map((tier,i)=><button type="button" key={tier.minQty+'-'+i}
              onClick={()=>selectQuantity(tier.minQty)}
              className={validQuantity&&quantity>=Number(tier.minQty)&&
                (!tier.maxQty||quantity<=Number(tier.maxQty))?'is-current':''}>
              {tier.minQty}{tier.maxQty?'–'+tier.maxQty:'+'} pcs
            </button>)}
          </div>}
          <label className="sk-checkout-quantity-input">Pieces
            <input type="number" min="1" max="100000" step="1" inputMode="numeric"
              value={qty} onChange={e=>{setQuantityTouched(true);setQty(e.target.value);}}
              onBlur={()=>{if(!validQuantity)selectQuantity(initialOrderQuantity(product));}}/>
          </label>
          <div className="sk-checkout-total" aria-live="polite">
            <span>{unitPrice!==null?'₹'+unitPrice.toLocaleString('en-IN')+' / piece':'Price on request'}</span>
            <strong>{estimatedBasePaise!==null?rupees(estimatedBasePaise):'Request quote'}</strong>
          </div>
          {accurateTotal!==null&&<div className="sk-checkout-pricing-breakdown">
            <span>GST {estimate.taxIncluded?'included':'additional'}: {rupees(estimate.taxPaise)}</span>
            <span>Delivery: {rupees(estimate.deliveryPaise)}</span>
            <strong>Payable total: {rupees(accurateTotal)}</strong>
          </div>}
          <details className="sk-checkout-extra">
            <summary>Design details <FaChevronDown aria-hidden="true"/></summary>
            {product.description&&<p>{product.description}</p>}
            {product.size&&<p>Size: {String(product.size)}</p>}
          </details>
        </div>}
      </section>
      <section className="sk-checkout-panel sk-checkout-customer">
        <h2>Your details</h2>
        {error&&<p className="sk-checkout-error" role="alert">{error}</p>}
        <form onSubmit={submit}>
          <label>Full name<input required maxLength="80" minLength="2" autoComplete="name"
            placeholder="Your name" value={form.name}
            onChange={e=>setForm({...form,name:e.target.value})}/></label>
          <label>Mobile number<input required type="tel" inputMode="numeric"
            pattern="[6-9][0-9]{9}" maxLength="10" autoComplete="tel-national"
            placeholder="10-digit mobile number" value={form.phone}
            onChange={e=>setForm({...form,phone:e.target.value.replace(/[^0-9]/g,'')})}/></label>
          {upiAvailable&&<label>Delivery address<textarea required rows="2" minLength="10"
            maxLength="500" value={form.address}
            onChange={e=>setForm({...form,address:e.target.value})}/></label>}
          <details className="sk-checkout-extra">
            <summary>Customise design (optional) <FaChevronDown aria-hidden="true"/></summary>
            <label>Size<input maxLength="80" value={custom.size}
              onChange={e=>setCustom({...custom,size:e.target.value})}/></label>
            <label>Material<input maxLength="80" value={custom.material}
              onChange={e=>setCustom({...custom,material:e.target.value})}/></label>
            <label>Required by<input type="date" value={custom.deadline}
              onChange={e=>setCustom({...custom,deadline:e.target.value})}/></label>
            <label>Artwork wording / instructions<textarea rows="2" maxLength="500"
              value={custom.artworkNotes}
              onChange={e=>setCustom({...custom,artworkNotes:e.target.value})}/></label>
            <p>Share artwork files with our team on WhatsApp after submitting the request.</p>
          </details>
          <button className="sk-checkout-pay" type="submit"
            disabled={busy||loading||!product||!validQuantity||estimateLoading}>
            {busy?'Submitting…':upiAvailable?'Pay '+rupees(accurateTotal)+' securely':
              'Request confirmed quotation'}
          </button>
        </form>
        <a className="sk-checkout-whatsapp" href={waLink} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp/> Chat about this design
        </a>
        <p className="sk-checkout-note">
          {upiAvailable?'Payable amount includes configured GST and delivery.':
          'No payment collected until price, GST and delivery are confirmed.'}
          {' '}Custom print production starts after artwork approval.
        </p>
        <Link className="sk-order-policy-link" to="/order-information">
          Ordering, delivery and cancellation information
        </Link>
      </section>
    </div>
  </main>;
}
