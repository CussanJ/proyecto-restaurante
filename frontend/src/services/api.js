import axios from 'axios';

// Al no poner http:// ni puertos, el navegador usa automáticamente 
// el mismo protocolo (HTTP o HTTPS) y el mismo HOST desde el que cargó la página.
export const productosApi = axios.create({
  baseURL: '/api/productos',
});

export const pedidosApi = axios.create({
  baseURL: '/api/pedidos',
});

export const inventarioApi = axios.create({
  baseURL: '/api/inventario',
});

export const authApi = axios.create({
  baseURL: '/api/auth', // Asegúrate de agregar esta ruta en tu nginx.conf si usas auth
});