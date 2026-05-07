import axios from 'axios';

export const productosApi = axios.create({ baseURL: 'http://localhost:3001' });
export const pedidosApi = axios.create({ baseURL: 'http://localhost:3003' });
export const inventarioApi = axios.create({ baseURL: 'http://localhost:3002' });
