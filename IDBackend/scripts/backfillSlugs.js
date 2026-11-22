import mongoose from 'mongoose';
import 'dotenv/config';
import Listing from '../models/Listing.js';
import {backfillListingSlugs} from '../utils/productSeo.js';
if(!process.env.MONGO_URI)throw new Error('MONGO_URI must be configured');
try{await mongoose.connect(process.env.MONGO_URI);console.log('Product slugs backfilled:',await backfillListingSlugs(Listing));}
finally{await mongoose.disconnect();}
