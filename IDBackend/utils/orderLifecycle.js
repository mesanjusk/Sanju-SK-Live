import {randomBytes,createHash} from 'node:crypto';

export const WORKFLOW_STAGES=[
  'new_order','design_in_progress','awaiting_approval','ready_for_print',
  'in_print','post_print','ready','delivered','on_hold','cancelled'
];
const allowed={
  new_order:['design_in_progress','on_hold','cancelled'],
  design_in_progress:['awaiting_approval','on_hold','cancelled'],
  awaiting_approval:['design_in_progress','ready_for_print','on_hold','cancelled'],
  ready_for_print:['in_print','on_hold','cancelled'],
  in_print:['post_print','on_hold'],
  post_print:['ready','on_hold'],
  ready:['delivered','on_hold'],
  delivered:[],on_hold:['design_in_progress','awaiting_approval','ready_for_print','cancelled'],
  cancelled:[]
};
export function canMoveOrder(from,to,artworkStatus){
  if(!allowed[from]?.includes(to))return false;
  return to!=='ready_for_print'||artworkStatus==='approved';
}
export function makeTrackingToken(){
  const token=randomBytes(32).toString('hex');
  return {token,hash:hashTrackingToken(token)};
}
export function hashTrackingToken(token){
  return createHash('sha256').update(String(token)).digest('hex');
}
export function cleanInput(value,max=300){
  return String(value??'').trim().slice(0,max);
}
export function cleanCustomer(customer={},requireAddress=false){
  const name=cleanInput(customer.name,80),phone=cleanInput(customer.phone,20),
    address=cleanInput(customer.address,500);
  if(name.length<2||!(/^[6-9][0-9]{9}$/.test(phone))||(requireAddress && address.length<10)){
    throw new Error('Enter a name, valid 10-digit mobile number'+
      (requireAddress?' and full delivery address.':'.'));
  }
  return {name,phone,address,instructions:cleanInput(customer.instructions,500)};
}
export function cleanCustomization(custom={}){
  return {
    size:cleanInput(custom.size,80),material:cleanInput(custom.material,80),
    deadline:cleanInput(custom.deadline,50),artworkNotes:cleanInput(custom.artworkNotes,500)
  };
}
export function publicOrderStatus(order){
  return {
    reference:String(order._id),title:order.title,quantity:order.quantity,
    workflowStatus:order.workflowStatus||'new_order',artworkStatus:order.artworkStatus||'not_submitted',
    paymentStatus:order.status,updatedAt:order.updatedAt,
    estimatedTotalPaise:order.amountPaise,deliveryStatus:order.deliveryStatus||'not_dispatched',
    trackingNumber:order.trackingNumber||'',artworkPreviewUrl:order.artworkPreviewUrl||'',
    history:(order.history||[]).filter(x=>x.public).map(x=>({
      event:x.event,note:x.note,createdAt:x.createdAt
    }))
  };
}
