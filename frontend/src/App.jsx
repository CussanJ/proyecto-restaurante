import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import Menu from './pages/Menu';
import Carrito from './pages/Carrito';
import EstadoPedido from './pages/EstadoPedido';
import Inventario from './pages/Inventario';
import PanelCocina from './pages/PanelCocina';
import './App.css';

function App() {
  return (
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Menu />} />
          <Route path="/menu" element={<Menu />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/pedido/:id" element={<EstadoPedido />} />
          <Route path="/admin/inventario" element={<Inventario />} />
          <Route path="/admin/cocina" element={<PanelCocina />} />
        </Routes>
      </BrowserRouter>
    </CartProvider>
  );
}

export default App;
