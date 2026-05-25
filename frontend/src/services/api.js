import axios from 'axios';

const host = window.location.hostname;

const PRODUCTOS_PORT = import.meta.env.VITE_PRODUCTOS_PORT || 3001;
const PEDIDOS_PORT = import.meta.env.VITE_PEDIDOS_PORT || 3003;
const INVENTARIO_PORT = import.meta.env.VITE_INVENTARIO_PORT || 3002;
const AUTH_PORT = import.meta.env.VITE_AUTH_PORT || 3004;

export const productosApi = axios.create({
  baseURL: `http://${host}:${PRODUCTOS_PORT}`,
});

export const pedidosApi = axios.create({
  baseURL: `http://${host}:${PEDIDOS_PORT}`,
});

export const inventarioApi = axios.create({
  baseURL: `http://${host}:${INVENTARIO_PORT}`,
});

export const authApi = axios.create({
  baseURL: `http://${host}:${AUTH_PORT}`,
});