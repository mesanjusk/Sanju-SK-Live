import {Link} from 'react-router-dom';
import {FaArrowLeft,FaWhatsapp,FaPhoneAlt} from 'react-icons/fa';
import SEO from '../components/SEO';
import {resetAnalyticsConsent} from '../hooks/useAnalytics';
import '../styles/pinterest-responsive-2026.css';
export default function OrderInformation(){
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
        <h2>Optional website analytics</h2>
        <p>Only after you choose “Allow analytics”, we use randomly generated browser
          and session IDs to count page views, product interest, search and campaign sources,
          and checkout steps. We record broad device/browser/OS categories and connection
          speed labels when available. We do not collect hardware identifiers, raw IP addresses,
          Wi-Fi names, advertising IDs, precise location or device fingerprint data in
          analytics. Analytics events automatically expire after 180 days.
          Browser settings and privacy tools may affect reporting accuracy.</p>
        <button type="button" onClick={resetAnalyticsConsent}
          className="sk-order-policy-link">Change analytics preferences or withdraw consent</button>
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
