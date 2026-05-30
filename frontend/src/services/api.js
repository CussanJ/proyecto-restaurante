import axios from 'axios';

const host = window.location.hostname;
const protocol = window.location.protocol;

// Ahora todo pasa centralizado a través del puerto de Nginx (245)
const GATEWAY_URL = `${protocol}//${host}:245`;

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