import { useEffect, useState } from "react";
import api from "../services/api";
import "./productos.css";

function Productos() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    api.get("/productos")
      .then(res => setProductos(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <div>
      <h2>Menú</h2>

      <div className="grid">
        {productos.map((p) => (
          <div className="card" key={p.id}>
            <h3>{p.nombre}</h3>
            <p className="price">${p.precio}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Productos;