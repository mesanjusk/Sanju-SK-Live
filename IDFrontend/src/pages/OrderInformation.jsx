import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {FaArrowLeft,FaWhatsapp,FaPhoneAlt} from 'react-icons/fa';
import SEO from '../components/SEO';
import {analyticsConsent,setAnalyticsConsent} from '../hooks/useAnalytics';
import '../styles/pinterest-responsive-2026.css';
export default function OrderInformation(){
  const [choice,setChoice]=useState(analyticsConsent);
  useEffect(()=>{
    const update=()=>setChoice(analyticsConsent());
    window.addEventListener('sk-analytics-consent',update);
    return()=>window.removeEventListener('sk-analytics-consent',update);
  },[]);
  const selectChoice=value=>{
    setAnalyticsConsent(value);
    setChoice(analyticsConsent());
  };
  return <main className="sk-order-tracking sk-public-site">
    <SEO title="Ordering, delivery and customer help" pathname="/order-information"/>
    <div className="sk-tracking-content">
      <header className="sk-checkout-header">
        <Link to="/" aria-label="Return home"><FaArrowLeft/></Link>
        <strong>Ordering information</strong>
      </header>
      <section className="sk-checkout-panel">
        <h1>Custom orders at SANJU SK Digital</h1>
        <p>We create wedding invitations, signage, awards and other made-to-order print designs. Every order is reviewed for its specifications before production.</p>
        <h2>Quotation and payment</h2>
        <p>Custom sizes, materials, quantity, GST and delivery charges are confirmed in the final written quotation. An estimate shown on a product card may differ from the final total. Online payment is offered only when verified merchant checkout and pricing are active.</p>
        <h2>Artwork approval</h2>
        <p>Our team prepares a design proof where needed. Please check names, dates, spelling, colors and dimensions. Production begins after the artwork is approved and the studio confirms the job.</p>
        <h2>Delivery and collection</h2>
        <p>The method, delivery cost, serviceable location and estimated completion date will be confirmed for your order. You can ask for collection at our Gondia studio where available. Delivery estimates depend on the product and carrier.</p>
        <h2>Changes, cancellations and refunds</h2>
        <p>Custom production may limit what can be changed after artwork approval or printing begins. Ask the team for the cancellation and refund terms applicable to your written quote before making payment. Your rights under applicable consumer law remain unaffected. We will review damaged or incorrectly supplied products with the order reference and supporting photos.</p>
        <h2>How we use your order details</h2>
        <p>Customer names, mobile numbers, delivery addresses and customization instructions are collected to process an enquiry or order and to provide updates. Approved service providers may process payment, messaging or delivery information where required. Do not share your private order tracking key publicly.</p>
        <section id="analytics-preferences" className="sk-inline-analytics-preferences" aria-label="Optional website analytics preferences">
          <h2>Optional website analytics</h2>
          <p>With your permission, we use randomly generated browser and session IDs to
            count page views, product interest, search and campaign sources, and checkout
            steps. We also record broad device, browser, operating system and connection
            quality categories where available. We do not store hardware identifiers,
            raw IP addresses, Wi-Fi names, advertising IDs, precise location or device
            fingerprints. Analytics events expire after 180 days.</p>
          <p><strong>Your preference:</strong> {choice==='accepted'?'Analytics allowed':
            choice==='declined'?'Analytics declined':'Not chosen — optional analytics off'}</p>
          <div className="sk-analytics-choice-inline">
            <button type="button" aria-pressed={choice==='accepted'}
              onClick={()=>selectChoice('accepted')}>Allow optional analytics</button>
            <button type="button" aria-pressed={choice==='declined'}
              onClick={()=>selectChoice('declined')}>Decline / withdraw consent</button>
          </div>
          <p>You can change your choice here at any time. Existing consented analytics
            continue until you withdraw; declining prevents future optional tracking.
            Privacy tools and browser settings can affect reporting accuracy.</p>
        </section>
        <h2>Questions or privacy requests</h2>
        <p>SANJU SK Digital – Mahi Creation, Krishnapura Ward, in front of Santoshi Mata Mandir, Gondia, Maharashtra 441601.</p>
        <div className="sk-order-help-links">
          <a href="tel:+919372333633"><FaPhoneAlt/> +91 93723 33633</a>
          <a href="https://wa.me/919372333633" target="_blank" rel="noopener noreferrer"><FaWhatsapp/> WhatsApp support</a>
          <a href="mailto:skgondia@gmail.com">skgondia@gmail.com</a>
          <Link to="/track-order">Track an existing order</Link>
        </div>
      </section>
    </div>
  </main>;
}
