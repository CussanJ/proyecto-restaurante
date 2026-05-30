import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados de toque y envío
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmarTouched, setConfirmarTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const passwordValido = password.length >= 6;
  const confirmarValido = confirmar === password;

  const passwordError = (passwordTouched || submitted) && (
    !password
      ? 'La contraseña es requerida.'
      : !passwordValido
      ? 'La contraseña debe tener al menos 6 caracteres.'
      : null
  );

  const confirmarError = (confirmarTouched || submitted) && (
    !confirmar
      ? 'Por favor confirma tu contraseña.'
      : !confirmarValido
      ? 'Las contraseñas no coinciden.'
      : null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');

    if (!passwordValido || !confirmarValido) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }

    setCargando(true);
    try {
      const msg = await resetPassword(token, password);
      setExito(msg);
      setTimeout(() => navigate('/admin/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'El enlace es inválido o ha expirado.');
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
        <div className="max-w-[440px] w-full">

          {/* Éxito */}
          {exito && (
            <div className="bg-tertiary-container/10 border border-tertiary/20 p-lg rounded-xl flex items-start gap-md mb-lg">
              <span className="material-symbols-outlined text-tertiary">check_circle</span>
              <div className="space-y-xs">
                <p className="font-semibold text-tertiary">¡Contraseña actualizada!</p>
                <p className="text-body-md text-on-surface-variant">{exito}</p>
                <p className="text-body-md text-on-surface-variant">Redirigiendo al login...</p>
              </div>
            </div>
          )}

          {/* Formulario */}
          {!exito && (
            <div className="bg-[#1A1A1A] border border-[#2D2D2D] rounded-xl p-xl shadow-2xl">
              <div className="space-y-sm mb-xl">
                <div
                  className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-primary-container/20 mb-sm"
                  style={{ backgroundColor: 'rgba(242,122,24,0.1)' }}
                >
                  <span className="material-symbols-outlined text-primary-container text-3xl">lock_reset</span>
                </div>
                <h1 className="text-headline-lg text-on-surface">Nueva contraseña</h1>
                <p className="text-body-md text-on-surface-variant">
                  Elige una contraseña segura para tu cuenta de administrador.
                </p>
              </div>

              {error && (
                <div className="bg-error-container/20 border border-error/30 rounded-lg px-md py-sm text-error text-body-md flex items-center gap-sm mb-lg">
                  <span className="material-symbols-outlined text-lg">error</span>
                  {error}
                </div>
              )}

              <form className="space-y-lg" onSubmit={handleSubmit}>
                 {/* Nueva contraseña */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="password">
                    Nueva contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-lg">lock</span>
                    </div>
                    <input
                      id="password"
                      type={mostrarPass ? 'text' : 'password'}
                      placeholder="Mínimo 6 caracteres"
                      value={password}
                      onBlur={() => setPasswordTouched(true)}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className={`w-full bg-[#1E1E1E] border text-on-surface rounded-lg py-3 pl-11 pr-12 focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-body-md transition-all ${
                        passwordError ? 'border-error' : 'border-[#2D2D2D]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarPass(!mostrarPass)}
                      className="absolute inset-y-0 right-0 pr-md flex items-center text-outline hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-lg">
                        {mostrarPass ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                  {passwordError && (
                    <p className="text-error text-[11px] pl-xs mt-1">{passwordError}</p>
                  )}
                </div>

                {/* Confirmar contraseña */}
                <div className="space-y-xs">
                  <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="confirmar">
                    Confirmar contraseña
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                      <span className="material-symbols-outlined text-lg">verified_user</span>
                    </div>
                    <input
                      id="confirmar"
                      type="password"
                      placeholder="Repite tu contraseña"
                      value={confirmar}
                      onBlur={() => setConfirmarTouched(true)}
                      onChange={e => setConfirmar(e.target.value)}
                      required
                      className={`w-full bg-[#1E1E1E] border text-on-surface rounded-lg py-3 pl-11 pr-md focus:ring-1 focus:ring-primary-container focus:border-primary-container outline-none text-body-md transition-all ${
                        confirmarError ? 'border-error' : 'border-[#2D2D2D]'
                      }`}
                    />
                  </div>
                  {confirmarError && (
                    <p className="text-error text-[11px] pl-xs mt-1">{confirmarError}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={cargando}
                  className="w-full bg-primary-container text-white font-semibold py-4 rounded-lg transition-all shadow-lg hover:brightness-110 active:scale-[0.98] flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {cargando ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Actualizando...
                    </>
                  ) : (
                    <>
                      Guardar nueva contraseña
                      <span className="material-symbols-outlined">check</span>
                    </>
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
