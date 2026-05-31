import { createContext, useContext, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const agregarItem = (producto) => {
    setItems(prev => {
      const existe = prev.find(i => i._id === producto._id);
      if (existe) {
        return prev.map(i =>
          i._id === producto._id ? { ...i, cantidad: i.cantidad + 1 } : i
        );
      }
      return [...prev, { ...producto, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (id, delta) => {
    setItems(prev =>
      prev
        .map(i => i._id === id ? { ...i, cantidad: i.cantidad + delta } : i)
        .filter(i => i.cantidad > 0)
    );
  };

  const eliminarItem = (id) => {
    setItems(prev => prev.filter(i => i._id !== id));
  };

  const vaciarCarrito = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{ items, agregarItem, cambiarCantidad, eliminarItem, vaciarCarrito, total }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
