import axios from 'axios';

// Usa el mismo host con el que se abrió la app.
// Así funciona desde localhost Y desde la IP de la red (teléfono, tablet).
const host = window.location.hostname;

export const productosApi  = axios.create({ baseURL: `http://${host}:3001` });
export const pedidosApi    = axios.create({ baseURL: `http://${host}:3003` });
export const inventarioApi = axios.create({ baseURL: `http://${host}:3002` });
export const authApi       = axios.create({ baseURL: `http://${host}:3004` });
