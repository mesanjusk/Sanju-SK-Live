import {useCallback,useEffect,useState} from 'react';
import {
  Alert,Box,Button,Chip,Paper,Table,TableBody,TableCell,TableContainer,
  TableHead,TableRow,Typography,TextField,MenuItem,Stack
} from '@mui/material';
import api from '../../api';
const stages=[
  ['new_order','New order'],['design_in_progress','Designing'],
  ['awaiting_approval','Awaiting approval'],['ready_for_print','Approved for print'],
  ['in_print','In print'],['post_print','Finishing & packing'],
  ['ready','Ready'],['delivered','Delivered'],['on_hold','On hold'],['cancelled','Cancelled']
];
const stageMap=Object.fromEntries(stages);
const allowed={
  new_order:['design_in_progress','on_hold','cancelled'],
  design_in_progress:['awaiting_approval','on_hold','cancelled'],
  awaiting_approval:['design_in_progress','ready_for_print','on_hold','cancelled'],
  ready_for_print:['in_print','on_hold','cancelled'],
  in_print:['post_print','on_hold'],post_print:['ready','on_hold'],
  ready:['delivered','on_hold'],delivered:[],
  on_hold:['design_in_progress','awaiting_approval','ready_for_print','cancelled'],cancelled:[]
};
const money=paise=>'₹'+(Number(paise||0)/100).toLocaleString('en-IN',{maximumFractionDigits:2});
const waPhone=n=>/^\d{10}$/.test(String(n||''))?'91'+n:'';
function downloadCsv(orders){
  const cols=['Reference','Date','Design','Customer','Phone','Quantity',
    'Payment status','Workflow','Artwork','Total INR','Offline collected INR','MIS sync'];
  const escape=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  const rows=orders.map(o=>[
    o._id,o.createdAt,o.title,o.customer?.name,o.customer?.phone,o.quantity,
    o.status,o.workflowStatus,o.artworkStatus,Number(o.amountPaise||0)/100,
    Number(o.offlineCollectedPaise||0)/100,o.misSync
  ].map(escape).join(','));
  const blob=new Blob([[cols.map(escape).join(','),...rows].join('\n')],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);
  const a=document.createElement('a');a.href=url;a.download='sk-orders-'+Date.now()+'.csv';
  document.body.appendChild(a);a.click();a.remove();
  URL.revokeObjectURL(url);
}
export default function OrdersManager(){
  const [orders,setOrders]=useState([]),[loading,setLoading]=useState(true);
  const [error,setError]=useState(''),[feedback,setFeedback]=useState('');
  const [filter,setFilter]=useState(''),[page,setPage]=useState(1),[total,setTotal]=useState(0);
  const [selected,setSelected]=useState(null),[actionBusy,setActionBusy]=useState(false);
  const [proof,setProof]=useState(''),[quote,setQuote]=useState(''),
    [amount,setAmount]=useState(''),[bankRef,setBankRef]=useState(''),
    [staffNote,setStaffNote]=useState('');
  const [delivery,setDelivery]=useState({status:'not_dispatched',courierName:'',trackingNumber:''});

  const refresh=useCallback(async()=>{
    setLoading(true);setError('');
    try{
      const response=await api.get('/api/orders',{timeout:16000,params:{
        page,limit:50,...(filter?{workflowStatus:filter}:{})
      }});
      setOrders(Array.isArray(response.data?.result)?response.data.result:[]);
      setTotal(response.data?.total??0);
    }catch(e){setError(e.response?.status===404?
      'Backend order management must be deployed to Render before this view works.':
      'Cannot load orders. Check your signed-in admin permissions or backend deployment.');}
    finally{setLoading(false);}
  },[page,filter]);
  useEffect(()=>{refresh();},[refresh]);
  const select=o=>{
    setSelected(o);setProof(o.artworkPreviewUrl||'');
    setQuote(o.quotedAmountPaise?String(o.quotedAmountPaise/100):'');
    setAmount('');setBankRef('');setStaffNote(o.adminNotes||'');
    setDelivery({status:o.deliveryStatus||'not_dispatched',courierName:o.courierName||'',
      trackingNumber:o.trackingNumber||''});
  };
  async function apply(action,value){
    if(!selected||actionBusy)return;
    setActionBusy(true);setFeedback('');setError('');
    try{
      const {data}=await api.patch('/api/orders/'+selected._id,{action,value},{timeout:18000});
      select(data.order);
      setOrders(prev=>prev.map(o=>o._id===data.order._id?data.order:o));
      setFeedback('Order updated. Use the WhatsApp link to notify the customer.');
    }catch(e){setError(e.response?.data?.message||'Order update failed.');}
    finally{setActionBusy(false);}
  }
  async function sync(){
    if(!selected||actionBusy)return;
    setActionBusy(true);setFeedback('');
    try{
      const {data}=await api.post('/api/orders/'+selected._id+'/sync',{},{timeout:18000});
      setFeedback('MIS integration status: '+data.status);
      await refresh();
    }catch{setError('MIS sync was not successful. Verify the configured endpoint.');}
    finally{setActionBusy(false);}
  }
  const paid=orders.filter(o=>o.status==='paid'),
    onlineTotal=paid.reduce((n,o)=>n+Number(o.amountPaise||0),0),
    offlineTotal=orders.reduce((n,o)=>n+Number(o.offlineCollectedPaise||0),0);
  const contact=selected&&waPhone(selected.customer?.phone)
    ? 'https://wa.me/'+waPhone(selected.customer.phone)+'?text='+encodeURIComponent(
      'Namaste '+(selected.customer?.name||'')+' ji, update on your SK Digital order '+
      selected._id+': '+(stageMap[selected.workflowStatus]||selected.workflowStatus)+
      '. Please check your private order tracking link or contact our studio.')
    :null;
  return <Box sx={{maxWidth:1250,mx:'auto',pb:5}}>
    <Stack direction={{xs:'column',sm:'row'}} justifyContent="space-between" spacing={1} mb={2}>
      <Box><Typography variant="h5" fontWeight={850}>Orders & production</Typography>
        <Typography variant="body2" color="text.secondary">
          Payment verification, customer artwork approvals and collection follow-ups
        </Typography></Box>
      <Stack direction="row" spacing={1}>
        <Button variant="outlined" disabled={!orders.length} onClick={()=>downloadCsv(orders)}>
          Export page CSV
        </Button>
        <Button variant="contained" onClick={refresh} disabled={loading}>Refresh</Button>
      </Stack>
    </Stack>
    {error&&<Alert severity="warning" sx={{mb:2}} onClose={()=>setError('')}>{error}</Alert>}
    {feedback&&<Alert severity="success" sx={{mb:2}} onClose={()=>setFeedback('')}>{feedback}</Alert>}
    <Stack direction="row" gap={1} flexWrap="wrap" mb={2}>
      <Chip label={'Total: '+total}/>
      <Chip color="success" label={'Gateway paid (page): '+paid.length}/>
      <Chip label={'Verified online collection (page): '+money(onlineTotal)}/>
      <Chip color="warning" label={'Recorded offline (unverified): '+money(offlineTotal)}/>
    </Stack>
    <Stack direction={{xs:'column',sm:'row'}} spacing={1} mb={2}>
      <TextField size="small" select label="Workflow" value={filter}
        onChange={e=>{setFilter(e.target.value);setPage(1);}}
        sx={{minWidth:180}}>
        <MenuItem value="">All orders</MenuItem>
        {stages.map(([id,label])=><MenuItem value={id} key={id}>{label}</MenuItem>)}
      </TextField>
      <Button variant="text" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</Button>
      <Typography sx={{alignSelf:'center'}} variant="body2">Page {page}</Typography>
      <Button variant="text" disabled={page*50>=total} onClick={()=>setPage(p=>p+1)}>Next</Button>
    </Stack>
    <TableContainer component={Paper} variant="outlined" sx={{borderRadius:3}}>
      <Table size="small"><TableHead><TableRow>
        <TableCell>Order</TableCell><TableCell>Customer</TableCell>
        <TableCell>Quantity</TableCell><TableCell>Amount</TableCell>
        <TableCell>Payment</TableCell><TableCell>Production</TableCell><TableCell/>
      </TableRow></TableHead><TableBody>
        {loading?<TableRow><TableCell colSpan={7}>Loading…</TableCell></TableRow>:
        orders.length===0?<TableRow><TableCell colSpan={7}>No orders yet.</TableCell></TableRow>:
        orders.map(o=><TableRow hover key={o._id} selected={selected?._id===o._id}>
          <TableCell><Typography variant="body2" fontWeight={750}>{o.title}</Typography>
            <Typography variant="caption">{o._id.slice(-9)} · {new Date(o.createdAt).toLocaleDateString('en-IN')}</Typography></TableCell>
          <TableCell><Typography variant="body2">{o.customer?.name}</Typography>
            <Typography variant="caption">{o.customer?.phone}</Typography></TableCell>
          <TableCell>{o.quantity}</TableCell>
          <TableCell>{o.amountPaise?money(o.amountPaise):'Quote pending'}</TableCell>
          <TableCell><Chip size="small" color={o.status==='paid'?'success':'default'}
            label={o.status==='paid'?'Gateway verified':(o.status||'').replaceAll('_',' ')}/></TableCell>
          <TableCell><Chip size="small" variant="outlined" label={stageMap[o.workflowStatus]||'New order'}/></TableCell>
          <TableCell><Button size="small" variant="text" onClick={()=>select(o)}>Manage</Button></TableCell>
        </TableRow>)}
      </TableBody></Table>
    </TableContainer>
    {selected&&<Paper variant="outlined" sx={{borderRadius:3,p:{xs:2,md:3},mt:3}}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight={800}>Manage {selected._id.slice(-9)}</Typography>
        <Button size="small" onClick={()=>setSelected(null)}>Close</Button>
      </Stack>
      <Typography fontWeight={750}>{selected.title} · {selected.quantity} pcs</Typography>
      <Typography variant="body2" sx={{mb:2}}>{selected.customer?.name} · {selected.customer?.phone} · {selected.customer?.address||'Address pending'}</Typography>
      <Typography variant="body2" sx={{mb:2}}>Customisation: {[
        selected.customization?.size,selected.customization?.material,selected.customization?.deadline,
        selected.customization?.artworkNotes].filter(Boolean).join(' · ')||'Not specified'}</Typography>
      <Stack direction={{xs:'column',md:'row'}} gap={2} flexWrap="wrap" mb={2}>
        <TextField select size="small" label="Next production stage"
          value="" sx={{minWidth:230}}
          onChange={e=>apply('workflow',e.target.value)}>
          <MenuItem value="" disabled>Select next step</MenuItem>
          {(allowed[selected.workflowStatus]||allowed.new_order).map(stage=>
            <MenuItem key={stage} value={stage}
              disabled={stage==='ready_for_print'&&selected.artworkStatus!=='approved'}>
              {stageMap[stage]}</MenuItem>)}
        </TextField>
        <Chip label={'Artwork: '+(selected.artworkStatus||'not_submitted').replaceAll('_',' ')}/>
        {contact&&<Button href={contact} rel="noopener noreferrer" target="_blank" variant="outlined">
          WhatsApp customer update
        </Button>}
      </Stack>
      <Stack spacing={2}>
        <Box><Typography variant="subtitle2" mb={1}>Artwork proof for customer approval</Typography>
          <Stack direction={{xs:'column',md:'row'}} gap={1}>
            <TextField fullWidth size="small" label="Cloudinary image preview URL"
              value={proof} onChange={e=>setProof(e.target.value)}/>
            <Button variant="contained" disabled={actionBusy||!proof} onClick={()=>apply('submit_artwork',proof)}>
              Send for approval
            </Button>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Use an uploaded Cloudinary image. Customer approval is required before printing.
          </Typography>
        </Box>
        <Box><Typography variant="subtitle2" mb={1}>Final quotation (manual, INR)</Typography>
          <Stack direction={{xs:'column',sm:'row'}} gap={1}>
            <TextField size="small" type="number" label="Quoted total ₹" inputProps={{min:1,step:0.01}}
              value={quote} onChange={e=>setQuote(e.target.value)}/>
            <Button variant="outlined" disabled={actionBusy||!quote||!Number.isFinite(Number(quote))}
              onClick={()=>apply('quotation',Math.round(Number(quote)*100))}>
              Save final quote
            </Button>
          </Stack></Box>
        <Box><Typography variant="subtitle2" mb={1}>Record offline collection (not gateway-verified)</Typography>
          <Stack direction={{xs:'column',sm:'row'}} gap={1}>
            <TextField size="small" label="Amount ₹" type="number" value={amount}
              onChange={e=>setAmount(e.target.value)} inputProps={{min:.01,step:.01}}/>
            <TextField size="small" label="Bank / UPI reference" value={bankRef}
              onChange={e=>setBankRef(e.target.value)}/>
            <Button variant="outlined" disabled={actionBusy||!bankRef||Number(amount)<=0}
              onClick={()=>apply('offline_payment',{
                amountPaise:Math.round(Number(amount)*100),reference:bankRef})}>
              Record collection
            </Button>
          </Stack></Box>
        <Box><Typography variant="subtitle2" mb={1}>Delivery update</Typography>
          <Stack direction={{xs:'column',sm:'row'}} gap={1}>
            <TextField size="small" select value={delivery.status} label="Status"
              onChange={e=>setDelivery({...delivery,status:e.target.value})} sx={{minWidth:160}}>
              <MenuItem value="not_dispatched">Not dispatched</MenuItem>
              <MenuItem value="dispatched">Dispatched</MenuItem>
              <MenuItem value="delivered">Delivered</MenuItem>
            </TextField>
            <TextField size="small" label="Courier" value={delivery.courierName}
              onChange={e=>setDelivery({...delivery,courierName:e.target.value})}/>
            <TextField size="small" label="Tracking reference" value={delivery.trackingNumber}
              onChange={e=>setDelivery({...delivery,trackingNumber:e.target.value})}/>
            <Button variant="outlined" disabled={actionBusy}
              onClick={()=>apply('delivery',delivery)}>Save</Button>
          </Stack></Box>
        <Box><Typography variant="subtitle2" mb={1}>Private staff note</Typography>
          <Stack direction={{xs:'column',sm:'row'}} gap={1}>
            <TextField size="small" fullWidth multiline minRows={2} value={staffNote}
              onChange={e=>setStaffNote(e.target.value)}/>
            <Button variant="outlined" disabled={actionBusy}
              onClick={()=>apply('note',staffNote)}>Save note</Button>
          </Stack></Box>
        <Stack direction="row" alignItems="center" gap={2}>
          <Chip label={'MIS sync: '+(selected.misSync||'not configured')}/>
          <Button size="small" variant="outlined" onClick={sync} disabled={actionBusy}>Retry MIS sync</Button>
        </Stack>
      </Stack>
    </Paper>}
  </Box>;
}
