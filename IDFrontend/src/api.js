import axios from 'axios';
import { validateEnv } from './config/env';

validateEnv();

axios.defaults.baseURL =
  import.meta.env.VITE_API_BASE_URL || 'https://sanju-sk-live.onrender.com';

export default axios;
