import Productos from "./pages/Productos";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>🍽️ Restaurante </h1>
      </header>

      <main className="container">
        <Productos />
      </main>

      <footer className="footer">
        <p>Sistema de pedidos e inventario</p>
      </footer>
    </div>
  );
}

export default App;