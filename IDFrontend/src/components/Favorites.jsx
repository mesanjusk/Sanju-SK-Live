import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaRegBookmark } from 'react-icons/fa';
import { useFavorites } from '../context/FavoritesContext';
import { uniqueDesigns } from './mobile/uniqueDesigns.mjs';
import PinterestPinCard from './mobile/PinterestPinCard';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';

function DesignCollection({items,kind}){
  const designs=uniqueDesigns(items);
  if(!designs.length)return (
    <section className="sk-public-empty" aria-label="No designs in this collection">
      {kind==='liked'?<FaHeart size={31}/>:<FaRegHeart size={31}/>}
      <h2 className="text-lg font-extrabold">No {kind} designs yet</h2>
      <p className="sk-public-muted text-xs">{kind==='liked'?
        'Like designs using the three-dot menu on a design card.':
        'Save designs by tapping the heart on any design.'}</p>
      <Link to="/">Explore designs</Link>
    </section>
  );
  return <div className="sk-pin-feed-wrap"><div className="sk-pin-masonry">
    {designs.map((product,index)=><PinterestPinCard key={product._id} product={product} index={index}/>)}
  </div></div>;
}

export default function Favorites(){
  const {favorites,liked}=useFavorites();
  const [tab,setTab]=useState('saved');
  return (
    <div className="sk-storefront sk-public-site sk-pinterest-home sk-saved-page min-h-screen pb-24">
      <MobileHeader/>
      <main>
        <h1 className="sk-public-section-title">Your designs</h1>
        <nav className="sk-public-tabs" role="tablist" aria-label="Saved and liked designs">
          <button className={'sk-public-tab'+(tab==='saved'?' is-active':'')} type="button"
            role="tab" aria-selected={tab==='saved'} onClick={()=>setTab('saved')}>
            <FaRegBookmark/> Saved <span className="sk-public-count">{uniqueDesigns(favorites).length}</span>
          </button>
          <button className={'sk-public-tab'+(tab==='liked'?' is-active':'')} type="button"
            role="tab" aria-selected={tab==='liked'} onClick={()=>setTab('liked')}>
            <FaHeart/> Liked <span className="sk-public-count">{uniqueDesigns(liked).length}</span>
          </button>
        </nav>
        <DesignCollection items={tab==='saved'?favorites:liked} kind={tab}/>
      </main>
      <MobileBottomNav variant="pinterest"/>
    </div>
  );
}
