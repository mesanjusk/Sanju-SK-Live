import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CONSENT_KEY,readConsentChoice,saveConsentChoice,forgetConsentChoice,
  markConsentPrompted,wasConsentPrompted,allowConsentPromptAgain
} from './consentPreference.mjs';

const storage=()=>{
  const values=new Map();
  return {
    getItem:key=>values.has(key)?values.get(key):null,
    setItem:(key,value)=>values.set(key,String(value)),
    removeItem:key=>values.delete(key)
  };
};
function setup(){
  const jar=new Map();
  globalThis.localStorage=storage();
  globalThis.sessionStorage=storage();
  globalThis.window={location:{hostname:'www.sanjusk.in',protocol:'https:'}};
  globalThis.document={
    get cookie(){return [...jar.entries()].map(([k,v])=>k+'='+v).join('; ');},
    set cookie(value){
      const [pair,...attrs]=String(value).split(';').map(x=>x.trim());
      const i=pair.indexOf('='),key=pair.slice(0,i),v=pair.slice(i+1);
      if(attrs.some(a=>/^max-age=0$/i.test(a)))jar.delete(key);
      else jar.set(key,v);
    }
  };
  return jar;
}
test('consent starts unset, persists, and is shared by first-party cookie fallback',()=>{
  const cookies=setup();
  forgetConsentChoice();
  assert.equal(readConsentChoice(),'unset');
  assert.equal(saveConsentChoice('accepted'),true);
  assert.equal(readConsentChoice(),'accepted');
  assert.equal(localStorage.getItem(CONSENT_KEY),'accepted');
  assert.equal(cookies.get('sk_analytics_choice_v2'),'accepted');
  globalThis.localStorage={getItem(){throw Error('storage blocked');},
    setItem(){throw Error('storage blocked');},removeItem(){throw Error('storage blocked');}};
  assert.equal(readConsentChoice(),'accepted');
  forgetConsentChoice();
  assert.equal(readConsentChoice(),'unset');
});
test('unanswered popup offered flag prevents repeated interruption in one tab',()=>{
  setup();
  forgetConsentChoice();
  allowConsentPromptAgain();
  assert.equal(wasConsentPrompted(),false);
  markConsentPrompted();
  assert.equal(wasConsentPrompted(),true);
  // Simulate a new page/tab: the first-party cookie remembers the offer.
  globalThis.sessionStorage=storage();
  assert.equal(wasConsentPrompted(),true);
  saveConsentChoice('declined');
  assert.equal(readConsentChoice(),'declined');
  allowConsentPromptAgain();
  assert.equal(wasConsentPrompted(),false);
});
test('invalid preference cannot be saved',()=>{
  setup();
  forgetConsentChoice();
  assert.equal(saveConsentChoice('unset'),false);
  assert.equal(saveConsentChoice('accepted'),true);
  assert.equal(saveConsentChoice('revoked'),false);
  assert.equal(readConsentChoice(),'accepted');
});
