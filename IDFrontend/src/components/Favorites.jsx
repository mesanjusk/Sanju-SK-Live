import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegBookmark, FaRegHeart, FaArrowRight } from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';
import PinterestPinCard from './mobile/PinterestPinCard';
import { uniqueDesigns } from './mobile/uniqueDesigns.mjs';
import './mobile/pinterest-storefront.css';

export default function Favorites() {
  const { favorites, liked } = useFavorites();
  const [tab, setTab] = useState('saved');
  const saved = useMemo(() => uniqueDesigns(favorites), [favorites]);
  const likedItems = useMemo(() => uniqueDesigns(liked), [liked]);
  const items = tab === 'saved' ? saved : likedItems;
  return (
    <div className="sk-storefront sk-public-theme sk-pinterest-home sk-activity-page">
      <MobileHeader />
      <main className="sk-activity-content">
        <div className="sk-activity-heading">
          <p className="sk-activity-kicker">YOUR INSPIRATION</p>
          <h1>Saved & liked designs</h1>
          <p>Keep your favourite printing ideas together.</p>
        </div>
        <div className="sk-activity-tabs" role="tablist" aria-label="Saved and liked designs">
          <button type="button" role="tab" id="sk-saved-tab" aria-controls="sk-activity-panel"
            aria-selected={tab === 'saved'} className={tab === 'saved' ? 'is-current' : ''}
            onClick={() => setTab('saved')}>
            <FaRegBookmark aria-hidden="true" /> Saved <span>{saved.length}</span>
          </button>
          <button type="button" role="tab" id="sk-liked-tab" aria-controls="sk-activity-panel"
            aria-selected={tab === 'liked'} className={tab === 'liked' ? 'is-current' : ''}
            onClick={() => setTab('liked')}>
            <FaHeart aria-hidden="true" /> Liked <span>{likedItems.length}</span>
          </button>
        </div>
        <div id="sk-activity-panel" role="tabpanel"
          aria-labelledby={tab === 'saved' ? 'sk-saved-tab' : 'sk-liked-tab'}>
          {items.length ? (
            <div className="sk-pin-masonry sk-activity-masonry">
              {items.map((item, index) => <PinterestPinCard key={item._id} product={item} index={index}/>)}
            </div>
          ) : (
            <div className="sk-activity-empty">
              <span className="sk-activity-empty-icon"><FaRegHeart aria-hidden="true"/></span>
              <h2>{tab === 'saved' ? 'No saved designs yet' : 'Nothing liked yet'}</h2>
              <p>{tab === 'saved' ? 'Tap the heart on any design to keep it here.' :
                'Your liked designs will appear here when you like them.'}</p>
              <Link to="/" className="sk-public-primary">Explore designs <FaArrowRight aria-hidden="true"/></Link>
            </div>
          )}
        </div>
      </main>
      <MobileBottomNav variant="pinterest"/>
    </div>
  );
}
