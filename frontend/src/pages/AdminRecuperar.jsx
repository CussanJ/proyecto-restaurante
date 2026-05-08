import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRecuperar() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const { recuperar } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);
    try {
      await recuperar(email);
      setEnviado(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el correo. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0A0A0A' }}>
      <header className="w-full px-6 py-4 flex justify-center md:justify-start">
        <span className="font-black tracking-tight text-xl text-orange-500">La Terraza del Mar</span>
      </header>

      <main className="flex-grow flex items-center justify-center px-container-margin py-xl">
        <div className="max-w-[440px] w-full space-y-lg">

          {/* Alerta de éxito */}
          {enviado && (
            <div className="bg-tertiary-container/10 border border-tertiary/20 p-lg rounded-xl flex items-start gap-md">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
              <div className="space-y-xs">
                <p className="font-semibold text-tertiary">Correo enviado</p>
                <p className="text-body-md text-on-surface-variant">
                  Revisa tu bandeja de entrada. Si el correo está registrado, recibirás el enlace de recuperación en los próximos minutos.
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-error-container/20 border border-error/30 rounded-lg px-md py-sm text-error text-body-md flex items-center gap-sm">
              <span className="material-symbols-outlined text-lg">error</span>
              {error}
            </div>
          )}

          {/* Tarjeta */}
          {!enviado && (
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-xl shadow-2xl">
              <div className="space-y-sm mb-xl">
                <h1 className="text-headline-lg text-on-surface">¿Olvidaste tu contraseña?</h1>
                <p className="text-body-md text-on-surface-variant">
                  Introduce tu correo electrónico para recibir un enlace de restablecimiento seguro.
                </p>
              </div>

              <form className="space-y-lg" onSubmit={handleSubmit}>
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="email">
                    Dirección de correo electrónico
                  </label>
                  <div className="relative group">
                    <input
                      id="email"
                      type="email"
                      placeholder="ejemplo@laterrazadelmar.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="w-full bg-[#1E1E1E] border border-[#2D2D2D] text-on-surface rounded-lg px-md py-3 pr-12 focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-body-md transition-all"
                    />
                    <span className="material-symbols-outlined absolute right-md top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary-container transition-colors">
                      mail
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-primary-container text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cargando ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Enviando...
                    </>
                  ) : (
                    'Enviar enlace de recuperación'
                  )}
                </button>

                <div className="text-center pt-md">
                  <Link
                    to="/admin/login"
                    className="inline-flex items-center gap-xs text-orange-500 hover:text-orange-400 text-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                    <span>Regresar al login</span>
                  </Link>
                </div>
              </form>
            </div>
          )}

          {/* Si ya se envió, mostrar opción de volver */}
          {enviado && (
            <div className="text-center">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-xs text-orange-500 hover:text-orange-400 text-label-md transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_back</span>
                <span>Regresar al login</span>
              </Link>
            </div>
          )}

          {/* Panel decorativo */}
          <div className="grid grid-cols-2 gap-md pt-lg">
            <div className="h-24 rounded-xl overflow-hidden bg-[#1A1A1A] border border-[#2D2D2D] relative">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBe2CqeM-ekrzYsNu8hJJHgbvp88rk6j4Hgh6PAOugXJkJwAi8dS9p8vKhCChxCX-1T22qIyo_7nD0G0jch9bQBoHge5mIfmUeuW3tvk5A7qNe8VYZdx-0Mg367tsFLNontLD5pUQuyKH788Up_5Kyy6Wt6uLf_j3yr3A7n5LulOnuAj4TLC7mJJGx_LC_f8QNsfJEpnDYV1WnOJFmOKo-aT9_XJWiL0BH6mnj-cpn6unjwgxwe4i5EeWGjfk4AASM9kfyPv_SWcqU_"
                alt="Cocina"
                className="w-full h-full object-cover opacity-40 grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="h-24 rounded-xl bg-[#1A1A1A] border border-[#2D2D2D] flex items-center justify-center flex-col gap-xs">
              <span className="material-symbols-outlined text-primary-container text-2xl">security</span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest text-center">Acceso Seguro</span>
            </div>
          </div>
        </div>
      </main>

      <footer className="p-container-margin text-center">
        <p className="text-label-md text-on-surface-variant opacity-50">
          © 2024 La Terraza del Mar. Todos los derechos reservados.
        </p>
      </footer>
    </div>
  );
}
