import {useEffect,useState} from 'react';
import {
  Alert,Box,Button,Chip,Paper,Table,TableBody,TableCell,TableContainer,
  TableHead,TableRow,Typography
} from '@mui/material';
import api from '../../api';

export default function OrdersManager(){
  const [orders,setOrders]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState('');
  async function refresh(){
    setLoading(true);setError('');
    try{
      const response=await api.get('/api/orders',{timeout:16000});
      setOrders(Array.isArray(response.data?.result)?response.data.result:[]);
    }catch(e){
      setError(e.response?.status===404?
        'Order management will become available after the updated backend is deployed.':
        'Could not load orders. Check your admin access or payment backend.');
    }finally{setLoading(false);}
  }
  useEffect(()=>{refresh();},[]);
  const paid=orders.filter(o=>o.status==='paid');
  const sum=paid.reduce((total,o)=>total+Number(o.amountPaise||0),0)/100;
  return <Box sx={{maxWidth:1200,mx:'auto'}}>
    <Box sx={{display:'flex',alignItems:'center',gap:2,mb:3,flexWrap:'wrap'}}>
      <Box sx={{flex:1}}>
        <Typography variant="h5" fontWeight={800}>Customer orders</Typography>
        <Typography variant="body2" color="text.secondary">Payments are only marked paid after verification.</Typography>
      </Box>
      <Button variant="outlined" onClick={refresh} disabled={loading}>Refresh</Button>
    </Box>
    {error && <Alert severity="warning" sx={{mb:2}}>{error}</Alert>}
    <Box sx={{display:'flex',flexWrap:'wrap',gap:1.5,mb:3}}>
      <Chip label={'Total orders: '+orders.length} />
      <Chip color="success" label={'Paid: '+paid.length} />
      <Chip label={'Verified collections: ₹'+sum.toLocaleString('en-IN')} />
    </Box>
    <TableContainer component={Paper} variant="outlined" sx={{borderRadius:3}}>
      <Table size="small">
        <TableHead><TableRow>
          <TableCell>Received</TableCell><TableCell>Order / Design</TableCell>
          <TableCell>Customer</TableCell><TableCell>Quantity</TableCell>
          <TableCell align="right">Amount</TableCell><TableCell>Status</TableCell>
        </TableRow></TableHead>
        <TableBody>
          {loading ? <TableRow><TableCell colSpan={6}>Loading orders…</TableCell></TableRow> :
          orders.length===0 ? <TableRow><TableCell colSpan={6}>No orders recorded yet.</TableCell></TableRow>:
          orders.map(o=><TableRow key={o._id} hover>
            <TableCell>{o.createdAt?new Date(o.createdAt).toLocaleDateString('en-IN'):'—'}</TableCell>
            <TableCell>
              <Typography variant="body2" fontWeight={700}>{o.title||'Design'}</Typography>
              <Typography variant="caption" color="text.secondary">{o._id}</Typography>
            </TableCell>
            <TableCell>
              <Typography variant="body2">{o.customer?.name||'—'}</Typography>
              <Typography variant="caption">{o.customer?.phone||''}</Typography>
            </TableCell>
            <TableCell>{o.quantity}</TableCell>
            <TableCell align="right">₹{(Number(o.amountPaise||0)/100).toLocaleString('en-IN')}</TableCell>
            <TableCell>
              <Chip size="small" color={o.status==='paid'?'success':'default'}
                label={o.status==='paid'?'Verified paid':(o.status||'pending').replaceAll('_',' ')} />
            </TableCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </TableContainer>
  </Box>;
}
