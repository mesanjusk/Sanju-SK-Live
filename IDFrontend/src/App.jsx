import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import api from './api';
import SEO from './components/SEO';
import LoadingSkeleton from './components/common/LoadingSkeleton';
import { routeMeta } from './config/routeMeta';
import WhatsAppCTA from './components/WhatsAppCTA';
import NotFound from './pages/NotFound';

const Home = lazy(() => import('./components/Home'));
const Home1 = lazy(() => import('./pages/Home1'));
const StoryGallery = lazy(() => import('./components/StoryGallery'));
const Upload = lazy(() => import('./components/Upload'));
const Insta = lazy(() => import('./components/Insta'));
const CreateListing = lazy(() => import('./components/CreateListing'));
const Listing = lazy(() => import('./components/listing'));
const ListingDetails = lazy(() => import('./components/ListingDetails'));
const Profile = lazy(() => import('./components/Profile'));
const UploadCategory = lazy(() => import('./pages/UploadCategory'));
const UploadSubcategory = lazy(() => import('./pages/UploadSubcategory'));
const AddTitle = lazy(() => import('./pages/addTitle'));
const AddPrice = lazy(() => import('./pages/addPrice'));
const AddUser = lazy(() => import('./pages/addUser'));
const Login = lazy(() => import('./pages/login'));
const AddInsta = lazy(() => import('./pages/addInsta'));
const AddSize = lazy(() => import('./pages/addSize'));
const AddReligion = lazy(() => import('./pages/addReligion'));
const AddSEOT = lazy(() => import('./pages/addSEOT'));
const AddSEOD = lazy(() => import('./pages/addSEOD'));
const AddSEOK = lazy(() => import('./pages/addSEOK'));
const UploadBanner = lazy(() => import('./pages/UploadBanner'));
const AllListing = lazy(() => import('./components/allLisiting'));
const AddConfi = lazy(() => import('./pages/addConfi'));
const List = lazy(() => import('./components/list'));
const FilterSubategory = lazy(() => import('./components/filterSubcategory'));
const SocialMedia = lazy(() => import('./components/SocialMedia'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Contact = lazy(() => import('./components/Contact'));
const AllCategory = lazy(() => import('./components/allCategory'));
const Favorites = lazy(() => import('./components/Favorites'));
const ProductListing = lazy(() => import('./pages/ProductListing'));
const ProductDetail = lazy(() => import('./pages/ProductDetail'));
const Cart = lazy(() => import('./pages/Cart'));
const Checkout = lazy(() => import('./pages/Checkout'));

const PageWithSeo = ({ children }) => {
  const { pathname } = useLocation();
  const dynamicMeta =
    (pathname.startsWith('/products/') && {
      title: 'Product Details',
      description: 'View product details, pricing, and add items to your cart.',
    }) ||
    (pathname.startsWith('/listing/') && {
      title: 'Listing Details',
      description: 'Explore listing information, media, and specifications.',
    }) ||
    (pathname.startsWith('/subcategory/') && {
      title: 'Subcategory',
      description: 'Browse filtered products in this subcategory.',
    }) ||
    (pathname.startsWith('/list/') && {
      title: 'List Item',
      description: 'View details for this selected list item.',
    });

  const meta =
    routeMeta[pathname] ||
    dynamicMeta || {
      title: 'Page',
      description: 'Explore Sanju SK products and services.',
    };

  return (
    <>
      <SEO title={meta.title} description={meta.description} pathname={pathname} noIndex={meta.noIndex} />
      {children}
    </>
  );
};

function AppRoutes() {
  return (
    <PageWithSeo>
      <Suspense fallback={<div className="p-4"><LoadingSkeleton count={3} /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/allListing" element={<AllListing />} />
          <Route path="/home1" element={<Home1 />} />
          <Route path="/allCategories" element={<AllCategory />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/story" element={<StoryGallery />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/instagram" element={<Insta />} />
          <Route path="/listing" element={<CreateListing />} />
          <Route path="/listing/:id" element={<ListingDetails />} />
          <Route path="/list" element={<Listing />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/UploadCategory" element={<UploadCategory />} />
          <Route path="/UploadSubcategory" element={<UploadSubcategory />} />
          <Route path="/UploadBanner" element={<UploadBanner />} />
          <Route path="/addTitle" element={<AddTitle />} />
          <Route path="/addPrice" element={<AddPrice />} />
          <Route path="/addInsta" element={<AddInsta />} />
          <Route path="/addSize" element={<AddSize />} />
          <Route path="/addReligion" element={<AddReligion />} />
          <Route path="/addSEOT" element={<AddSEOT />} />
          <Route path="/addSEOD" element={<AddSEOD />} />
          <Route path="/addSEOK" element={<AddSEOK />} />
          <Route path="/addUser" element={<AddUser />} />
          <Route path="/login" element={<Login />} />
          <Route path="/addConfi" element={<AddConfi />} />
          <Route path="/subcategory/:id" element={<FilterSubategory />} />
          <Route path="/list/:itemId" element={<List />} />
          <Route path="/SocialMedia" element={<SocialMedia />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/products" element={<ProductListing />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />

          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/product" element={<Navigate to="/products" replace />} />
          <Route path="/all-listing" element={<Navigate to="/allListing" replace />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <WhatsAppCTA />
    </PageWithSeo>
  );
}

function App() {
  const [backendReady, setBackendReady] = useState(false);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setBackendReady(true);
    }, 5000);

    api
      .get('/api/ping')
      .then(() => {
        clearTimeout(timeout);
        setBackendReady(true);
      })
      .catch(() => {
        clearTimeout(timeout);
        setBackendReady(true);
      });

    return () => clearTimeout(timeout);
  }, []);

  if (!backendReady) {
    return (
      <div className="mx-auto mt-16 max-w-5xl p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
