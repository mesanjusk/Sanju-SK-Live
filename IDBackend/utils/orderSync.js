import {createHmac} from 'node:crypto';
import axios from 'axios';

// Opt-in adapter. A MISBoth URL and shared signing secret must be supplied explicitly.
// No customer records are transferred when integration is unconfigured.
export async function syncCommerceOrder(order,event){
  const url=process.env.MIS_ORDER_WEBHOOK_URL,secret=process.env.MIS_ORDER_WEBHOOK_SECRET;
  if(!url||!secret)return {configured:false,sent:false};
  let parsed;
  try {parsed=new URL(url);} catch {return {configured:false,sent:false};}
  if(parsed.protocol!=='https:' || parsed.username || parsed.password)
    return {configured:false,sent:false};
  const payload=JSON.stringify({
    event,source:'sanjusk.in',occurredAt:new Date().toISOString(),
    order:{
      reference:String(order._id),title:order.title,quantity:order.quantity,
      customer:order.customer,customization:order.customization,
      workflowStatus:order.workflowStatus,status:order.status,
      artworkStatus:order.artworkStatus,amountPaise:order.amountPaise,
      paidAt:order.paidAt||null
    }
  });
  const signature=createHmac('sha256',secret).update(payload).digest('hex');
  try{
    const result=await axios.post(parsed.toString(),payload,{
      headers:{'Content-Type':'application/json','X-SK-Signature':signature,
        'X-SK-Event':event,'X-SK-Order-ID':String(order._id)},
      timeout:4500,maxRedirects:0,maxBodyLength:15000
    });
    return {configured:true,sent:result.status>=200&&result.status<300};
  }catch(e){
    console.warn('Order sync failed; admin can retry',String(e.message).slice(0,120));
    return {configured:true,sent:false};
  }
}
