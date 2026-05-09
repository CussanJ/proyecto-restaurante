import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import RutaProtegida from './components/RutaProtegida';
import Menu from './pages/Menu';
import Carrito from './pages/Carrito';
import EstadoPedido from './pages/EstadoPedido';
import Inventario from './pages/Inventario';
import PanelCocina from './pages/PanelCocina';
import AdminLogin from './pages/AdminLogin';
import AdminRecuperar from './pages/AdminRecuperar';
import AdminRegistro from './pages/AdminRegistro';
import AdminResetPassword from './pages/AdminResetPassword';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/"      element={<Menu />} />
            <Route path="/menu"  element={<Menu />} />
            <Route path="/carrito"     element={<Carrito />} />
            <Route path="/pedido/:id"  element={<EstadoPedido />} />

            {/* Autenticación admin */}
            <Route path="/admin/login"                   element={<AdminLogin />} />
            <Route path="/admin/recuperar"               element={<AdminRecuperar />} />
            <Route path="/admin/registro"                element={<AdminRegistro />} />
            <Route path="/admin/reset-password/:token"   element={<AdminResetPassword />} />

            {/* Rutas protegidas */}
            <Route path="/admin/inventario" element={
              <RutaProtegida><Inventario /></RutaProtegida>
            } />
            <Route path="/admin/cocina" element={
              <RutaProtegida><PanelCocina /></RutaProtegida>
            } />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
