import axios from 'axios';

// Al dejarlo vacío, el navegador usa automáticamente el protocolo, host y puerto actual (8103)
const GATEWAY_URL = ''; 

export const productosApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/productos`,
});

export const pedidosApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/pedidos`,
});

export const inventarioApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/inventario`,
});

export const authApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/auth`,
});