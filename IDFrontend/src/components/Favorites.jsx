import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegBookmark, FaRegHeart } from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';
import PinterestPinCard from './mobile/PinterestPinCard';
import { uniqueDesigns } from './mobile/uniqueDesigns.mjs';
import './mobile/pinterest-storefront.css';

export default function Favorites() {
  const { favorites, liked } = useFavorites();
  const [tab, setTab] = useState('saved');
  const savedItems = useMemo(() => uniqueDesigns(favorites), [favorites]);
  const likedItems = useMemo(() => uniqueDesigns(liked), [liked]);
  const items = tab === 'saved' ? savedItems : likedItems;

  return (
    <div className="sk-storefront sk-pinterest-home sk-saved-page">
      <MobileHeader title="Your collections"/>
      <main className="sk-saved-main">
        <header className="sk-saved-intro">
          <p className="sk-public-eyebrow">YOUR INSPIRATION BOARD</p>
          <h1>Saved & liked designs</h1>
          <p>Find the designs you love and share them when requesting a custom quotation.</p>
        </header>
        <div className="sk-saved-tabs" role="tablist" aria-label="Your design collections">
          <button type="button" role="tab" id="sk-tab-saved" aria-controls="sk-panel-saved"
            aria-selected={tab === 'saved'} className={'sk-saved-tab' + (tab === 'saved' ? ' is-active' : '')}
            onClick={() => setTab('saved')}>
            <FaRegBookmark aria-hidden="true"/> Saved <span className="sk-saved-count">{savedItems.length}</span>
          </button>
          <button type="button" role="tab" id="sk-tab-liked" aria-controls="sk-panel-liked"
            aria-selected={tab === 'liked'} className={'sk-saved-tab' + (tab === 'liked' ? ' is-active' : '')}
            onClick={() => setTab('liked')}>
            <FaRegHeart aria-hidden="true"/> Liked <span className="sk-saved-count">{likedItems.length}</span>
          </button>
        </div>
        <section id={'sk-panel-' + tab} className="sk-saved-gallery" role="tabpanel"
          aria-labelledby={'sk-tab-' + tab}>
          {items.length ? (
            <>
              <p className="sk-saved-gallery-count">{items.length} designs in your {tab} collection</p>
              <div className="sk-pin-masonry" aria-label={tab === 'saved' ? 'Your saved designs' : 'Your liked designs'}>
                {items.map((product,index)=><PinterestPinCard key={product._id} product={product}
                  index={index} />)}
              </div>
            </>
          ) : (
            <div className="sk-saved-empty">
              <div className="sk-saved-empty-icon" aria-hidden="true">
                {tab === 'saved' ? <FaRegBookmark/> : <FaHeart/>}
              </div>
              <h2>{tab === 'saved' ? 'No saved designs yet' : 'No liked designs yet'}</h2>
              <p>{tab === 'saved'
                ? 'Tap the save icon on a design to add it to your collection.'
                : 'Open a design’s three-dot menu and choose Like design.'}</p>
              <Link to="/" className="sk-public-button">Explore designs</Link>
            </div>
          )}
        </section>
      </main>
      <MobileBottomNav variant="pinterest"/>
    </div>
  );
}
