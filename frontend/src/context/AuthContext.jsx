import { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [cargando, setCargando] = useState(true);

  // Al iniciar la app, verificar si hay sesión guardada
  useEffect(() => {
    const verificar = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) { setCargando(false); return; }

      try {
        const { data } = await authApi.get('/auth/verificar', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAdmin(data.admin);
      } catch {
        localStorage.removeItem('auth_token');
      } finally {
        setCargando(false);
      }
    };
    verificar();
  }, []);

  const login = async (email, password) => {
    const { data } = await authApi.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', data.token);
    setAdmin(data.admin);
  };

  const registro = async (nombre, email, password) => {
    const { data } = await authApi.post('/auth/registro', { nombre, email, password });
    localStorage.setItem('auth_token', data.token);
    setAdmin(data.admin);
  };

  const recuperar = async (email) => {
    const { data } = await authApi.post('/auth/recuperar', { email });
    return data.mensaje;
  };

  const resetPassword = async (token, password) => {
    const { data } = await authApi.post('/auth/reset-password', { token, password });
    return data.mensaje;
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setAdmin(null);
  };

  return (
    <AuthContext.Provider value={{ admin, cargando, login, registro, recuperar, resetPassword, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
