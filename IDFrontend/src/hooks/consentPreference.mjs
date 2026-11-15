// Consent preferences are first-party functional storage, not analytics identifiers.
// Use a same-site cookie as a fallback where localStorage is restricted. Never infer
// consent from a missing value; a dismissed unanswered notice means decline.
export const CONSENT_KEY='sk_analytics_consent_v2';
const COOKIE_KEY='sk_analytics_choice_v2';
const PROMPT_KEY='sk_analytics_prompt_seen_v1';
const TTL_SECONDS=180*24*60*60;
const valid=value=>value==='accepted'||value==='declined';
let memoryChoice='unset';
let memoryPrompted=false;

function cookieOptions(){
  try{
    const host=window.location.hostname.toLowerCase();
    const domain=host==='sanjusk.in'||host.endsWith('.sanjusk.in')?'; Domain=sanjusk.in':'';
    const secure=window.location.protocol==='https:'?'; Secure':'';
    return '; Path=/; SameSite=Lax'+domain+secure;
  }catch{return '; Path=/; SameSite=Lax';}
}
function readCookie(){
  try{
    const part=document.cookie.split('; ').find(x=>x.startsWith(COOKIE_KEY+'='));
    const value=part?decodeURIComponent(part.slice(COOKIE_KEY.length+1)):'';
    return valid(value)?value:null;
  }catch{return null;}
}
export function readConsentChoice(){
  try{
    const choice=localStorage.getItem(CONSENT_KEY);
    if(valid(choice)){memoryChoice=choice;return choice;}
  }catch{}
  const cookie=readCookie();
  if(cookie){memoryChoice=cookie;return cookie;}
  return memoryChoice;
}
export function saveConsentChoice(value){
  if(!valid(value))return false;
  memoryChoice=value;
  try{localStorage.setItem(CONSENT_KEY,value);}catch{}
  try{document.cookie=COOKIE_KEY+'='+encodeURIComponent(value)+'; Max-Age='+TTL_SECONDS+cookieOptions();}catch{}
  return true;
}
export function forgetConsentChoice(){
  memoryChoice='unset';
  try{localStorage.removeItem(CONSENT_KEY);}catch{}
  try{document.cookie=COOKIE_KEY+'=; Max-Age=0'+cookieOptions();}catch{}
}
export function wasConsentPrompted(){
  if(memoryPrompted)return true;
  try{return sessionStorage.getItem(PROMPT_KEY)==='1';}catch{return false;}
}
export function markConsentPrompted(){
  memoryPrompted=true;
  try{sessionStorage.setItem(PROMPT_KEY,'1');}catch{}
}
export function allowConsentPromptAgain(){
  memoryPrompted=false;
  try{sessionStorage.removeItem(PROMPT_KEY);}catch{}
}
