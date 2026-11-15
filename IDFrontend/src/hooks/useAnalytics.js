import {useEffect} from 'react';
import {useLocation} from 'react-router-dom';
import api from '../api';
import {readConsentChoice,saveConsentChoice,forgetConsentChoice,allowConsentPromptAgain} from './consentPreference.mjs';

const VISITOR_KEY='sk_analytics_visitor_v2';
const SESSION_KEY='sk_analytics_session_v2';
const ATTR_KEY='sk_analytics_attr_v2';
const ALLOWED_EVENTS=new Set(['pageview','category_view','product_view','product_click',
  'search','favorite_save','checkout_start','quote_request','whatsapp_click',
  'payment_client_confirmed']);
const clean=s=>String(s||'').toLowerCase().replace(/[^a-z0-9 _.-]+/g,' ').trim().slice(0,64);
function safeCampaign(s){
  const original=String(s||'');
  if(/[0-9]{8,}|@/.test(original))return '';
  return clean(original);
}
function uuid(){
  if(crypto.randomUUID)return crypto.randomUUID();
  const bytes=crypto.getRandomValues(new Uint8Array(16));
  bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
  const h=Array.from(bytes,n=>n.toString(16).padStart(2,'0')).join('');
  return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20)].join('-');
}
export function analyticsConsent(){
  return readConsentChoice();
}
export function setAnalyticsConsent(value){
  if(!['accepted','declined'].includes(value))return;
  if(value==='declined'){
    try{
      const prior=localStorage.getItem(VISITOR_KEY);
      localStorage.removeItem(VISITOR_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(ATTR_KEY);
      // Opt-out is stored only as a functional preference, not as consent.
      if(prior)api.delete('/api/analytics/visitor',{data:{visitorId:prior},timeout:6000}).catch(()=>{});
    }catch{}
  }
  saveConsentChoice(value);
  if(typeof window!=='undefined')
    window.dispatchEvent(new CustomEvent('sk-analytics-consent',{detail:value}));
}
export function resetAnalyticsConsent(){
  try{
    const id=localStorage.getItem(VISITOR_KEY);
    localStorage.removeItem(VISITOR_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(ATTR_KEY);
    if(id)api.delete('/api/analytics/visitor',{data:{visitorId:id},timeout:6000}).catch(()=>{});
  }catch{}
  forgetConsentChoice();
  allowConsentPromptAgain();
  if(typeof window!=='undefined')
    window.dispatchEvent(new CustomEvent('sk-analytics-consent',{detail:'unset'}));
}
function getIds(){
  let visitorId=localStorage.getItem(VISITOR_KEY),isNew=false;
  if(!visitorId){visitorId=uuid();localStorage.setItem(VISITOR_KEY,visitorId);isNew=true;}
  let sessionId=sessionStorage.getItem(SESSION_KEY);
  if(!sessionId){sessionId=uuid();sessionStorage.setItem(SESSION_KEY,sessionId);}
  return {visitorId,sessionId,isNew};
}
function deviceInfo(){
  const ua=navigator.userAgent||'';
  const device=/ipad|tablet/i.test(ua)?'tablet':/mobi|android|iphone/i.test(ua)?'mobile':'desktop';
  const os=/android/i.test(ua)?'Android':/iphone|ipad|ipod/i.test(ua)?'iOS':
    /windows/i.test(ua)?'Windows':/mac os/i.test(ua)?'macOS':
    /linux/i.test(ua)?'Linux':'Other';
  const browser=/edg\//i.test(ua)?'Edge':/firefox|fxios/i.test(ua)?'Firefox':
    /crios|chrome/i.test(ua)?'Chrome':/safari/i.test(ua)?'Safari':'Other';
  const net=navigator.connection?.effectiveType||'unknown';
  const networkType=['slow-2g','2g','3g','4g'].includes(net)?net:'unknown';
  return {device,browser,os,networkType};
}
function attribution(){
  const params=new URLSearchParams(window.location.search);
  let saved={};
  try{saved=JSON.parse(sessionStorage.getItem(ATTR_KEY)||'{}');}catch{}
  if(!saved.source){
    let host='';
    try{host=new URL(document.referrer).hostname.toLowerCase().slice(0,120);}catch{}
    const isSearch=/\b(google|bing|duckduckgo|yahoo)\b/.test(host);
    const provider=['google','bing','duckduckgo','yahoo','instagram','facebook','pinterest','youtube','whatsapp','twitter'].find(name=>host.includes(name))||'';
    const isSocial=/\b(instagram|facebook|pinterest|youtube|twitter|t\.co|whatsapp)\b/.test(host);
    saved={
      source:safeCampaign(params.get('utm_source')||provider||(host?'referral':'direct')),
      medium:safeCampaign(params.get('utm_medium')||(isSearch?'organic':isSocial?'social':host?'referral':'none')),
      campaign:safeCampaign(params.get('utm_campaign')),
      keyword:safeCampaign(params.get('utm_term')||params.get('q')||params.get('search')),
      referrerDomain:host,
      landingPath:window.location.pathname.slice(0,130)
    };
    try{sessionStorage.setItem(ATTR_KEY,JSON.stringify(saved));}catch{}
  }
  return saved;
}
export function trackAnalyticsEvent(event,{productId='',categoryId='',categoryName='',keyword=''}={}){
  if(typeof window==='undefined'||!ALLOWED_EVENTS.has(event)||analyticsConsent()!=='accepted')return;
  if(/^\/(admin|login|profile|upload|listing)/i.test(window.location.pathname))return;
  try{
    const ids=getIds();
    const path=window.location.pathname.slice(0,160);
    const data={...ids,...deviceInfo(),...attribution(),path,event,
      productId:String(productId||'').slice(0,50),
      categoryId:String(categoryId||'').slice(0,80),
      categoryName:String(categoryName||'').slice(0,70)};
    if(event==='search')data.keyword=safeCampaign(keyword);
    api.post('/api/analytics/track',data,{timeout:6000}).catch(()=>{});
  }catch{}
}
export function trackWhatsAppClick(productId=''){
  trackAnalyticsEvent('whatsapp_click',{productId});
}
export function useAnalytics(){
  const location=useLocation();
  useEffect(()=>{
    const page=()=>trackAnalyticsEvent('pageview');
    page();
    window.addEventListener('sk-analytics-consent',page);
    return()=>window.removeEventListener('sk-analytics-consent',page);
  },[location.pathname]);
}
