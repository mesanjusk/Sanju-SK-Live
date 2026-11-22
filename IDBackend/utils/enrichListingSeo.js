// Conservative, deterministic SEO copy for MongoDB Listing documents.
// Existing URLs are NEVER derived from new titles; the migration writes no slug fields.
import {textOnly,merchantPrice} from './googleMerchantFeed.js';

const SITE_LINE='Custom printed by SANJU SK Digital in Gondia, Maharashtra with pan-India delivery';
const GENERIC=/^(?:i[\s-]?card|id[\s-]?card|housie(?: tickets?)?|tambola(?: tickets?)?|cut[\s-]?out|cones?|tags?|badges?|floral|acrylic|welcome board|playing cards?|name[\s-]?plate|mementos?|trophies?|envelopes?|visiting cards?|business cards?)$/i;
const trim=(v)=>textOnly(v).replace(/\s+/g,' ').trim();
const key=(v)=>trim(v).toLowerCase().replace(/[^a-z0-9]+/g,' ');
const isObjectId=v=>/^[a-f0-9]{24}$/i.test(String(v||''));
const proper=v=>trim(v).toLowerCase().replace(/\b[a-z]/g,x=>x.toUpperCase())
 .replace(/\bPvc\b/g,'PVC').replace(/\bLed\b/g,'LED').replace(/\b3d\b/g,'3D').replace(/\bId\b/g,'ID')
 .replace(/\bUv\b/g,'UV').replace(/\bMdf\b/g,'MDF');
const clipped=(value,max)=>String(value).length<=max?value:value.slice(0,max+1).replace(/\s+\S*$/,'').replace(/[- ,;/]+$/,'').trim();

export function needsSeoEnrichment(p){
 if(!p||typeof p.title!=='string'||Object.hasOwn(p,'originalTitle'))return false;
 const t=trim(p.title);
 if(!t||!p.slug||typeof p.slug!=='string'||!isObjectId(p._id))return false;
 // Never touch existing long descriptive titles or medium titles unless
 // explicitly known to be generic.
 return t.length<30||GENERIC.test(t);
}
export function proposedTitle(p,category='',subcategory=''){
 const raw=trim(p.title),label=key(raw),context=key(category+' '+subcategory);
 const evidence=key([p.description,p.seoDescription,p.seoKeywords,category,subcategory].join(' '));
 const birthday=/\bbirthday\b|\bb day\b/.test(evidence+' '+label);
 const wedding=!birthday&&/\bwedding\b|\bshaadi\b|\bmarriage\b|\bbridal\b/.test(context+' '+evidence);
 const invitation=/invitation|cards?/.test(context);
 const signage=/signage|sign boards?|name plates?|channel letters?|neon|shop fronts?/.test(context+' '+evidence);
 const material=trim(p.material);
 let title='';
 if(/^(i card|icard|id card)$/.test(label)) title='Custom PVC School & Office ID Card Printing with Lanyard';
 else if(/^housie( tickets)?$|^tambola( tickets)?$/.test(label)) title='Custom Printed Wedding & Event Housie Tambola Tickets';
 else if(/^cut ?out$/.test(label)) title='Custom Life-Size Foam Board Event & Wedding Photo Cutout';
 else if(/^cones?$/.test(label)) title='Custom Printed Wedding Mehendi & Haldi Floral Cones';
 else if(/^welcome board$/.test(label)) title='Custom Acrylic & Sunboard Wedding Welcome Signage Board';
 else if(/^playing cards?$/.test(label)) title='Custom Personalized Wedding & Party Theme Playing Cards';
 else if(/^floral$/.test(label)&&birthday) title='Custom Floral Birthday Invitation Cards with Photo Printing';
 else if(/^floral$/.test(label)&&wedding) title='Custom Floral Designer Wedding Invitation Card';
 else if(/^floral$/.test(label)&&invitation) title='Custom Floral Printed Invitation Cards for Events & Parties';
 else if(/^acrylic$/.test(label)&&wedding) title='Custom Laser-Cut Acrylic Wedding Invitation Card';
 else if(/^acrylic$/.test(label)&&signage) title='Custom Laser-Cut Acrylic Signage & Personalized Name Plate';
 else if(/^acrylic$/.test(label)) return null; // Unknown legacy category: don't invent a material/use case.
 else if(/^tag$|^tags$/.test(label)) title='Custom Printed Gift & Event Name Tags with Personalization';
 else if(/^badge$|^badges$/.test(label)) title='Custom Printed Event & Office Badges with Logo Design';
 else if(/^name plate$/.test(label)) title='Custom Acrylic Name Plate for Home & Office Signage';
 else if(/^mementos?$/.test(label)) title='Custom Engraved Corporate Mementos & Recognition Awards';
 else if(/^trophies?$/.test(label)) title='Custom Personalized Event Trophies & Corporate Awards';
 else if(/^envelopes?$/.test(label)) title='Custom Printed Wedding & Business Invitation Envelopes';
 else if(/^birthdays?$/.test(label)) title='Custom Printed Birthday Invitation Cards with Photo & Name';
 else if(/^invitations?$/.test(label)) title='Custom Personalized Printed Invitation Cards for Events & Parties';
 else if(/^visiting cards?$|^business cards?$/.test(label)) title='Custom Professional Business & Visiting Card Printing';
 else if(raw.length<30 && wedding && /floral|laser|royal|classic|modern|premium|traditional/i.test(raw))
  title='Custom '+proper(raw)+' Wedding Invitation Card Printing';
 else if(raw.length<30 && /troph|award|memento/i.test(context))
  title='Custom '+proper(raw)+' Corporate Awards & Mementos';
 else if(raw.length<30 && /sign|led|neon/.test(context))
  title='Custom '+proper(raw)+' Signage for Shops & Offices';
 else if(raw.length<30 && invitation && birthday)
  title='Custom '+proper(raw)+' Birthday Invitation Card Printing';
 else if(raw.length<30 && invitation && wedding)
  title='Custom '+proper(raw)+' Wedding Invitation Card Printing';
 else if(raw.length<30 && invitation)
  title='Custom '+proper(raw)+' Printed Invitations for Events & Parties';
 else if(raw.length<30 && /printing|stationery|corporate|design/.test(context))
  title='Custom '+proper(raw)+' Printing for Events & Businesses';
 else return null;
 if(material&&material.length<22&&!key(title).includes(key(material))&&title.length+material.length+3<=85)
  title=proper(material)+' '+title;
 title=title.replace(/\s+/g,' ').trim();
 if(title.length>85)title=clipped(title,85);
 // Don't write vague copy just to reach a character count.
 if(title.length<45||title.length>85)return null;
 return title;
}
export function proposedDescription(p,title){
 const material=trim(p.material),size=trim(p.size),details=trim(p.customizationDetails);
 const price=merchantPrice(p);
 const first=title+' can be personalized with names, dates, logos or photos.';
 const parts=[];
 if(material)parts.push('Material: '+clipped(material,32));
 if(size)parts.push('size: '+clipped(size,24));
 if(details)parts.push('custom details: '+clipped(details,42));
 const second=parts.length?parts.join('; ')+'.':'Artwork, layout and sizing options can be discussed before printing.';
 const priceNote=price?(price.minQty>1?
  '; MOQ '+price.minQty+' pieces at ₹'+price.amount+' per piece':
  '; starting at ₹'+price.amount+' per piece'):'';
 const third=SITE_LINE+priceNote+'.';
 let description=[first,second,third].join(' ');
 if(description.length>300)
  description=[first,'Artwork and sizing can be customized.',third].join(' ');
 if(description.length>300)
  description=[title+' can be customized with names, dates and logos.','Artwork can be adapted.',third].join(' ');
 if(description.length<150)
  description=[first,'Artwork, layout and sizing options are available for your event or business.',third].join(' ');
 return description.length<=300&&description.length>=150?description:null;
}
const categoryName=(v,map)=>map.get(String(v?._id||v||''))||(!isObjectId(v)?trim(v):'');
const scopeFor=p=>String(p.category?._id||p.category||'');
const uniqueKey=(p,title)=>scopeFor(p)+'\u0000'+key(title);

export function createSeoPreview(products,categories=[],subcategories=[]){
 const c=new Map(categories.map(p=>[String(p._id),trim(p.name)]));
 const s=new Map(subcategories.map(p=>[String(p._id),trim(p.name)]));
 const ordered=[...products].sort((a,b)=>String(a._id).localeCompare(String(b._id)));
 const reserved=new Set(ordered.filter(p=>!needsSeoEnrichment(p)).map(p=>uniqueKey(p,trim(p.title))));
 const rows=[];
 for(const p of ordered){
  if(!needsSeoEnrichment(p))continue;
  const category=categoryName(p.category,c);
  const subcategory=categoryName(p.subcategory,s);
  const title=proposedTitle(p,category,subcategory);
  if(!title)continue;
  rows.push({product:p,category,subcategory,title});
 }
 const counts=new Map();
 for(const row of rows){const k=uniqueKey(row.product,row.title);counts.set(k,(counts.get(k)||0)+1);}
 const sequence=new Map();
 const result=[];
 for(const row of rows){
  const k=uniqueKey(row.product,row.title);
  const seq=(sequence.get(k)||0)+1;sequence.set(k,seq);
  let title=row.title;
  if(counts.get(k)>1||reserved.has(k)){
   let count=seq;
   let candidate='';
   do{
    const suffix=' Design '+String(count).padStart(2,'0');
    candidate=clipped(row.title,85-suffix.length)+suffix;
    count++;
   }while(reserved.has(uniqueKey(row.product,candidate)));
   title=candidate;
  }
  const description=proposedDescription(row.product,title);
  if(!description)continue;
  reserved.add(uniqueKey(row.product,title));
  // Only enrich descriptions that are thin/generic. Keep detailed authored copy.
  const existing=trim(row.product.description);
  const thin=existing.length<150||/listed unit price applies|custom print(?:ed|ing)? available/i.test(existing)&&existing.length<225;
  result.push({
   id:String(row.product._id),slug:row.product.slug,category:row.category||'(unknown)',
   subcategory:row.subcategory||'',beforeTitle:row.product.title,
   afterTitle:title,beforeDescription:row.product.description||'',
   afterDescription:thin?description:row.product.description||'',
   changeDescription:thin,
   beforeSeoTitle:row.product.seoTitle||'',
   beforeSeoDescription:row.product.seoDescription||'',
   changeSeoTitle:trim(row.product.seoTitle).length<35,
   changeSeoDescription:trim(row.product.seoDescription).length<110
  });
 }
 return result;
}
