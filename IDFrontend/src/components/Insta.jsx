import { useEffect, useMemo, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import api from '../api';
import MobileHeader from './mobile/MobileHeader';
import MobileBottomNav from './mobile/MobileBottomNav';
import './mobile/pinterest-storefront.css';

const categories = ['All', 'Wedding', 'Birthday', 'Vastu', 'Opening'];

export default function InstagramStyleGallery() {
  const [images,setImages] = useState([]);
  const [category,setCategory] = useState('All');
  const [liked,setLiked] = useState({});
  const [preview,setPreview] = useState(null);
  const [status,setStatus] = useState('loading');
  useEffect(() => {
    let active = true;
    api.get('/api/images',{ timeout:15000 }).then(response => {
      if (!active) return;
      setImages(Array.isArray(response.data) ? response.data : response.data?.result || []);
      setStatus('ready');
    }).catch(() => { if (active) setStatus('error'); });
    return () => { active = false; };
  }, []);
  const visible=useMemo(() => category === 'All' ? images :
    images.filter(item => item.category === category),[images,category]);
  return (
    <div className="sk-storefront sk-pinterest-home min-h-screen pb-28">
      <MobileHeader title="Creative inspiration"/>
      <main className="sk-pin-feed-wrap">
        <header className="sk-saved-intro">
          <p className="sk-public-eyebrow">DESIGNED IN GONDIA</p>
          <h1 className="text-2xl font-extrabold">Creative inspiration</h1>
          <p className="text-xs text-gray-500">Browse artwork and celebration design ideas.</p>
        </header>
        <nav className="sk-pin-categories" aria-label="Inspiration categories">
          {categories.map(name=><button key={name} type="button"
            className={'sk-pin-category-tab'+(category===name?' is-current':'')}
            aria-pressed={category===name} onClick={()=>setCategory(name)}>{name}</button>)}
        </nav>
        {status==='loading' && <p className="py-20 text-center text-sm text-gray-500" role="status">Preparing artwork…</p>}
        {status==='error' && <p className="py-20 text-center text-sm text-gray-500">The artwork gallery is temporarily unavailable.</p>}
        {status==='ready' && (visible.length ? (
          <div className="sk-pin-masonry" aria-label="Art and design inspiration">
            {visible.map((item,index)=>(
              <article key={item._id||item.url} className={'sk-pin-card sk-pin-shape-'+(index%5)}>
                <div className="sk-pin-cover-wrap">
                  <button type="button" className="sk-pin-cover" onClick={()=>setPreview(item)}
                    aria-label={'View '+(item.title||'artwork')}>
                    <img src={item.url} alt={item.title||'SANJU SK Digital artwork'}
                      loading="lazy" decoding="async"/>
                  </button>
                  <button type="button" className={'sk-pin-save'+(liked[item._id]?' is-saved':'')}
                    aria-label={liked[item._id]?'Unlike image':'Like image'}
                    aria-pressed={Boolean(liked[item._id])}
                    onClick={()=>setLiked(prev=>({...prev,[item._id]:!prev[item._id]}))}>
                    {liked[item._id]?<FaHeart/>:<FaRegHeart/>}
                  </button>
                </div>
                <p className="sk-pin-card-title px-1 pt-2">{item.title||'Creative design'}</p>
              </article>
            ))}
          </div>
        ) : <p className="py-20 text-center text-sm text-gray-500">No artwork in this collection yet.</p>)}
      </main>
      {preview && (
        <div className="sk-pin-detail-modal" role="dialog" aria-modal="true"
          aria-label="Art preview" onClick={()=>setPreview(null)}>
          <div onClick={event=>event.stopPropagation()}>
            <button type="button" onClick={()=>setPreview(null)}>Close preview</button>
            <img src={preview.url} alt={preview.title||'Artwork preview'}
              className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"/>
          </div>
        </div>
      )}
      <MobileBottomNav variant="pinterest"/>
    </div>
  );
}
