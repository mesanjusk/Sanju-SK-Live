import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaEllipsisH, FaSearch, FaTimes, FaWhatsapp, FaPhoneAlt, FaHeart } from 'react-icons/fa';

const keyOf = c => String(c?._id || c?.category_uuid || '');
export default function PinterestHeader({categories=[],selectedCategory,catalogReady,searchTerm,onSearchChange,onCategorySelect,whatsappNumber,phoneNumber}) {
  const [searchOpen,setSearchOpen]=useState(false);
  const [menuOpen,setMenuOpen]=useState(false);
  const menuRef=useRef(null);
  const wa=String(whatsappNumber||'919372333633').replace(/\D/g,'');
  useEffect(()=>{
    if(!menuOpen)return undefined;
    const close=e=>{if(!menuRef.current?.contains(e.target))setMenuOpen(false);};
    const esc=e=>{if(e.key==='Escape')setMenuOpen(false);};
    document.addEventListener('pointerdown',close);document.addEventListener('keydown',esc);
    return ()=>{document.removeEventListener('pointerdown',close);document.removeEventListener('keydown',esc);};
  },[menuOpen]);
  return <header className="sk-pin-header">
    <div className="sk-pin-topline">
      <Link to="/" className="sk-pin-brand" aria-label="SANJU SK Digital home">
        <span className="sk-pin-brand-symbol">SK</span><span>SANJU <strong>SK</strong></span>
      </Link>
      <div className="sk-pin-actions" ref={menuRef}>
        <a href={'https://wa.me/'+wa+'?text='+encodeURIComponent('Hello SANJU SK Digital, I want a custom design quotation.')}
          className="sk-pin-top-action" target="_blank" rel="noopener noreferrer"
          aria-label="Request a custom design"><FaPlus aria-hidden="true"/></a>
        <button type="button" className="sk-pin-top-action" aria-label="Open menu"
          aria-expanded={menuOpen} onClick={()=>setMenuOpen(v=>!v)}>
          <FaEllipsisH aria-hidden="true"/>
        </button>
        {menuOpen&&<nav className="sk-pin-top-menu" aria-label="Additional navigation">
          <Link to="/favorites" onClick={()=>setMenuOpen(false)}><FaHeart/> Saved designs</Link>
          <Link to="/contact" onClick={()=>setMenuOpen(false)}><FaPhoneAlt/> Contact studio</Link>
          <a href={'https://wa.me/'+wa} target="_blank" rel="noopener noreferrer"><FaWhatsapp/> WhatsApp quotation</a>
          <a href={'tel:'+phoneNumber}><FaPhoneAlt/> Call us</a>
        </nav>}
      </div>
    </div>
    <div className="sk-pin-categories" role="tablist" aria-label="Explore design categories">
      {catalogReady
        ? <>
          <button role="tab" aria-selected={!selectedCategory}
            className={'sk-pin-category'+(!selectedCategory?' is-active':'')}
            onClick={()=>onCategorySelect(null)}>All</button>
          {categories.map(c=><button type="button" role="tab" key={keyOf(c)}
            aria-selected={keyOf(c)===keyOf(selectedCategory)}
            className={'sk-pin-category'+(keyOf(c)===keyOf(selectedCategory)?' is-active':'')}
            onClick={()=>onCategorySelect(c)}>{c.name}</button>)}
        </>
        : <div className="sk-pin-category-placeholder" aria-busy="true">Preparing design categories…</div>}
    </div>
    <div className={'sk-pin-search-row'+(searchOpen?' is-open':'')}>
      <FaSearch aria-hidden="true"/>
      <input id="sk-pinterest-search" type="search" value={searchTerm}
        placeholder="Search designs and products" disabled={!catalogReady}
        onFocus={()=>setSearchOpen(true)} onChange={e=>onSearchChange(e.target.value)}
        aria-label="Search designs"/>
      {(searchOpen||searchTerm)&&<button type="button" aria-label="Clear search" onClick={()=>{
        onSearchChange('');setSearchOpen(false);document.activeElement?.blur?.();
      }}><FaTimes/></button>}
    </div>
  </header>;
}
