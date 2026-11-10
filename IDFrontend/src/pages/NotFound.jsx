import { Link } from 'react-router-dom';
import MobileHeader from '../components/mobile/MobileHeader';
import MobileBottomNav from '../components/mobile/MobileBottomNav';
import '../components/mobile/pinterest-storefront.css';

export default function NotFound() {
  return (
    <div className="sk-storefront sk-pinterest-home min-h-screen pb-28">
      <MobileHeader title="Page unavailable"/>
      <main className="mx-auto flex min-h-[65vh] max-w-lg flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="sk-public-eyebrow">404 · PAGE NOT FOUND</p>
        <h1 className="text-2xl font-extrabold">We couldn't find this design.</h1>
        <p className="max-w-sm text-sm leading-6 text-gray-500">
          This page may have moved. Explore the latest designs in our gallery instead.
        </p>
        <Link to="/" className="sk-public-button mt-4">Explore designs</Link>
      </main>
      <MobileBottomNav variant="pinterest"/>
    </div>
  );
}
