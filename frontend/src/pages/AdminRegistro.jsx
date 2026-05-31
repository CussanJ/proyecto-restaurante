import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRegistro() {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [terminos, setTerminos] = useState(false);
  const [mostrarPass, setMostrarPass] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  // Estados de toque y envío
  const [nombreTouched, setNombreTouched] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [confirmarTouched, setConfirmarTouched] = useState(false);
  const [terminosTouched, setTerminosTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { registro } = useAuth();
  const navigate = useNavigate();

  // Validaciones en tiempo real
  const nombreValido = nombre.trim().length >= 5;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const passwordValido = password.length >= 6;
  const confirmarValido = confirmar === password;

  const nombreError = (nombreTouched || submitted) && (
    !nombre.trim()
      ? 'El nombre completo es requerido.'
      : !nombreValido
      ? 'El nombre debe tener al menos 5 caracteres.'
      : null
  );

  const emailError = (emailTouched || submitted) && (
    !email
      ? 'El correo electrónico es requerido.'
      : !emailValido
      ? 'El formato del correo es inválido.'
      : null
  );

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

  const terminosError = (terminosTouched || submitted) && !terminos && 'Debes aceptar los términos de servicio.';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');

    if (!nombreValido || !emailValido || !passwordValido || !confirmarValido || !terminos) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }

    setCargando(true);
    try {
      await registro(nombre.trim(), email, password);
      navigate('/admin/cocina');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear la cuenta. Intenta de nuevo.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row">
      {/* Panel izquierdo con imagen */}
      <section className="hidden lg:flex lg:w-1/2 relative bg-surface overflow-hidden border-r border-outline-variant items-center justify-center">
        <div className="absolute inset-0 z-0">
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCCIn2LKTuq76C6dO8jQiUzUkV5YkSNHCMLUpFA319y183eUcL3P9cuNKWTlVeRU__d0X19MaFPOPqe0o1PtfQ7-MtpOTLy5wg0Ettb01CeVer00XDQfFrf-Od7CkPU9PUbM7tlpzzv0sDU8dpf9TGisznPli2zSPvMSz_1lHzZ4MlzfpiJtBS9vxkGnCI3EmPHIhCoHTqaGqSc91r50udj29frzET8hwMMxHcEBBAB1lzB4bokQd-I4eBnZlQYUOKlUpET6td939Nq"
            alt="Cocina profesional"
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        </div>
        <div className="relative z-10 px-lg max-w-xl">
          <div className="flex items-center gap-sm mb-lg">
            <span
              className="material-symbols-outlined text-primary-container"
              style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}
            >
              restaurant_menu
            </span>
            <h1 className="text-stats-xl font-black tracking-tighter text-on-surface">
              La Terraza <span className="text-primary-container">del Mar</span>
            </h1>
          </div>
          <h2 className="text-headline-lg mb-md text-on-surface">
            Precisión en cada plato, eficiencia en cada turno.
          </h2>
          <p className="text-body-lg text-on-surface-variant leading-relaxed">
            Únete a la plataforma de gestión operativa de La Terraza del Mar. Controla inventarios,
            pedidos y el panel de cocina en tiempo real.
          </p>
        </div>
      </section>

      {/* Panel derecho con formulario */}
      <section className="flex-1 flex items-center justify-center p-gutter md:p-container-margin bg-background">
        <div className="w-full max-w-[440px] flex flex-col">
          {/* Branding móvil */}
          <div className="lg:hidden flex items-center gap-sm mb-xl">
            <span
              className="material-symbols-outlined text-primary-container text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              restaurant_menu
            </span>
            <span className="text-headline-sm font-black text-on-surface">La Terraza del Mar</span>
          </div>

          <div className="mb-xl">
            <h2 className="text-headline-lg text-on-surface">Crea tu cuenta</h2>
            <p className="text-body-md text-on-surface-variant mt-xs">
              Comienza a gestionar el restaurante hoy mismo.
            </p>
          </div>

          <form className="space-y-lg" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container/20 border border-error/30 rounded-lg px-md py-sm text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Nombre */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="nombre">
                Nombre completo
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-lg">badge</span>
                </div>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej. Chef Rodrigo Alarcón"
                  value={nombre}
                  onBlur={() => setNombreTouched(true)}
                  onChange={e => setNombre(e.target.value)}
                  required
                  className={`w-full bg-surface-container-low border rounded-lg py-3 pl-11 pr-md text-on-surface text-body-md placeholder:text-neutral-600 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all ${
                    nombreError ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              </div>
              {nombreError && (
                <p className="text-error text-[11px] pl-xs mt-1">{nombreError}</p>
              )}
            </div>

            {/* Correo */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="email">
                Correo electrónico
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none text-outline">
                  <span className="material-symbols-outlined text-lg">mail</span>
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="nombre@laterrazadelmar.com"
                  value={email}
                  onBlur={() => setEmailTouched(true)}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`w-full bg-surface-container-low border rounded-lg py-3 pl-11 pr-md text-on-surface text-body-md placeholder:text-neutral-600 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all ${
                    emailError ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-error text-[11px] pl-xs mt-1">{emailError}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-xs">
              <label className="text-label-md text-on-surface-variant block ml-1" htmlFor="password">
                Contraseña
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
                  className={`w-full bg-surface-container-low border rounded-lg py-3 pl-11 pr-12 text-on-surface text-body-md placeholder:text-neutral-600 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all ${
                    passwordError ? 'border-error' : 'border-outline-variant'
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
                  className={`w-full bg-surface-container-low border rounded-lg py-3 pl-11 pr-md text-on-surface text-body-md placeholder:text-neutral-600 focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all ${
                    confirmarError ? 'border-error' : 'border-outline-variant'
                  }`}
                />
              </div>
              {confirmarError && (
                <p className="text-error text-[11px] pl-xs mt-1">{confirmarError}</p>
              )}
            </div>

            {/* Términos */}
            <div className="space-y-xs">
              <div className="flex items-start gap-sm">
                <input
                  id="terminos"
                  type="checkbox"
                  checked={terminos}
                  onBlur={() => setTerminosTouched(true)}
                  onChange={e => setTerminos(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-outline-variant bg-surface-container-low accent-[#f27a18]"
                />
                <label htmlFor="terminos" className="text-body-md text-on-surface-variant cursor-pointer">
                  Acepto los{' '}
                  <a href="#" className="text-primary-container hover:underline">Términos de Servicio</a>
                  {' '}y la{' '}
                  <a href="#" className="text-primary-container hover:underline">Política de Privacidad</a>.
                </label>
              </div>
              {terminosError && (
                <p className="text-error text-[11px] pl-xs mt-1">{terminosError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-primary-container text-white font-semibold py-4 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Creando cuenta...
                </>
              ) : (
                <>
                  Crear cuenta
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-xl text-center">
            <p className="text-body-md text-on-surface-variant">
              ¿Ya tienes cuenta?{' '}
              <Link to="/admin/login" className="text-primary-container font-bold hover:underline ml-1">
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Botón de soporte */}
      <button className="fixed bottom-lg right-lg w-14 h-14 bg-surface-container-high rounded-full flex items-center justify-center border border-outline-variant text-on-surface-variant shadow-xl hover:bg-surface-container-highest transition-colors group">
        <span className="material-symbols-outlined group-hover:scale-110 transition-transform">support_agent</span>
      </button>
    </main>
  );
}
