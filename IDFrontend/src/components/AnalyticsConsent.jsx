import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {analyticsConsent,setAnalyticsConsent} from '../hooks/useAnalytics';
import {markConsentPrompted,wasConsentPrompted} from '../hooks/consentPreference.mjs';
import '../styles/analytics-consent.css';

const SHOW_AFTER_MS=7000;
const VISIBLE_FOR_MS=8000;

export default function AnalyticsConsent(){
  const [choice,setChoice]=useState(analyticsConsent);
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const update=()=>setChoice(analyticsConsent());
    window.addEventListener('sk-analytics-consent',update);
    return()=>window.removeEventListener('sk-analytics-consent',update);
  },[]);
  useEffect(()=>{
    if(choice!=='unset'){
      setVisible(false);
      return undefined;
    }
    // Once a browser has been offered a choice, a reload must not repeatedly
    // interrupt shopping. Unanswered notices default to NO analytics.
    if(wasConsentPrompted()){
      setAnalyticsConsent('declined');
      return undefined;
    }
    let hideTimer;
    const showTimer=window.setTimeout(()=>{
      if(analyticsConsent()!=='unset')return;
      markConsentPrompted();
      setVisible(true);
      hideTimer=window.setTimeout(()=>{
        if(analyticsConsent()==='unset')setAnalyticsConsent('declined');
        setVisible(false);
      },VISIBLE_FOR_MS);
    },SHOW_AFTER_MS);
    return()=>{
      window.clearTimeout(showTimer);
      if(hideTimer)window.clearTimeout(hideTimer);
    };
  },[choice]);
  if(choice!=='unset'||!visible)return null;
  return <aside className="sk-analytics-consent" aria-label="Optional website analytics">
    <p><strong>Help improve SK Digital</strong>
      <span> Allow anonymous visits, designs viewed and shopping trends.
        No hardware ID, raw IP address or device fingerprint is stored.</span>
      <Link to="/order-information"> Privacy details</Link>
    </p>
    <div className="sk-analytics-consent-actions">
      <button type="button" onClick={()=>setAnalyticsConsent('declined')}>No thanks</button>
      <button type="button" onClick={()=>setAnalyticsConsent('accepted')}>Allow analytics</button>
    </div>
  </aside>;
}
