import {useEffect,useState} from 'react';
import {Link} from 'react-router-dom';
import {analyticsConsent,setAnalyticsConsent} from '../hooks/useAnalytics';
import '../styles/analytics-consent.css';

export default function AnalyticsConsent(){
  const [choice,setChoice]=useState(analyticsConsent);
  useEffect(()=>{
    const update=()=>setChoice(analyticsConsent());
    window.addEventListener('sk-analytics-consent',update);
    return()=>window.removeEventListener('sk-analytics-consent',update);
  },[]);
  if(choice!=='unset')return null;
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
