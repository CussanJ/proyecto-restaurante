import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [recordar, setRecordar] = useState(false);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
      : password.length < 6
      ? 'La contraseña debe tener al menos 6 caracteres.'
      : null
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    setError('');

    if (!email || !emailValido || password.length < 6) {
      setError('Por favor, corrige los errores en el formulario.');
      return;
    }

    setCargando(true);
    try {
      await login(email, password);
      navigate('/admin/cocina');
    } catch (err) {
      setError(err.response?.data?.error || 'Correo o contraseña incorrectos.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-container-margin"
      style={{
        backgroundImage:
          'linear-gradient(rgba(10,10,10,0.85), rgba(10,10,10,0.95)), url(https://lh3.googleusercontent.com/aida-public/AB6AXuBQNv1T3kVbdC6VdOYJIS82gb29Xjn52l7pTCTBnOhEkV_xFEmqlQEJDeaxyaVp_hlMrf-BzbFLFhtGK-uyiAweRAQ3jDqv8gjjgDCSk1QbBYmBbF4O_vRAxNTIMZSw9r1SoCTzAWY7hRC2kXJiO73Pukx409fIva6Td7lpWoAz5Za81RbYrhwjgWg1G7QB23FnYR_UgKkgEr62JiIUwvNUOb_D4fkS0ZAkiBisTLKQ28JGqYvoaq6wIhPrIdPhX6BUrDnWwMvl4fzc)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Barra superior */}
      <div className="absolute top-0 left-0 w-full p-lg flex items-center justify-between pointer-events-none">
        <img src="/logo.png" alt="La Terraza del Mar" className="h-14 w-auto object-contain" />
        <div className="hidden md:flex items-center gap-sm text-label-md uppercase text-outline">
          <span className="material-symbols-outlined text-sm">security</span>
          <span>Portal de Administración Seguro</span>
        </div>
      </div>

      {/* Tarjeta */}
      <div className="w-full max-w-[440px] z-10">
        <div className="bg-surface-container-low border border-surface-container-highest rounded-xl p-xl shadow-2xl">

          {/* Encabezado */}
          <div className="mb-xl text-center">
            <div className="flex justify-center mb-md">
              <img
                src="/logo.png"
                alt="La Terraza del Mar"
                className="h-40 w-auto object-contain"
              />
            </div>
            <h1 className="text-headline-md text-on-surface mb-xs">Bienvenido de nuevo</h1>
            <p className="text-body-md text-on-surface-variant">Inicie sesión para gestionar el restaurante</p>
          </div>

          {/* Formulario */}
          <form className="space-y-lg" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container/20 border border-error/30 rounded-lg px-md py-sm text-error text-body-md flex items-center gap-sm">
                <span className="material-symbols-outlined text-lg">error</span>
                {error}
              </div>
            )}

            {/* Correo */}
            <div className="space-y-xs">
              <label className="text-label-md text-outline px-xs block" htmlFor="email">
                CORREO ELECTRÓNICO
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary-container transition-colors">
                  mail
                </span>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@laterrazadelmar.com"
                  value={email}
                  onBlur={() => setEmailTouched(true)}
                  onChange={e => setEmail(e.target.value)}
                  required
                  className={`w-full bg-surface-container-highest border focus:border-primary-container text-on-surface rounded-lg pl-10 pr-md py-md outline-none text-body-md transition-all ${
                    emailError ? 'border-error' : 'border-surface-container-highest'
                  }`}
                />
              </div>
              {emailError && (
                <p className="text-error text-[11px] pl-xs mt-1">{emailError}</p>
              )}
            </div>

            {/* Contraseña */}
            <div className="space-y-xs">
              <div className="flex justify-between items-center px-xs">
                <label className="text-label-md text-outline block" htmlFor="password">
                  CONTRASEÑA
                </label>
                <Link
                  to="/admin/recuperar"
                  className="text-primary text-label-md hover:text-primary-container transition-colors"
                >
                  ¿Olvidó su contraseña?
                </Link>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary-container transition-colors">
                  lock
                </span>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onBlur={() => setPasswordTouched(true)}
                  onChange={e => setPassword(e.target.value)}
                  required
                  className={`w-full bg-surface-container-highest border focus:border-primary-container text-on-surface rounded-lg pl-10 pr-md py-md outline-none text-body-md transition-all ${
                    passwordError ? 'border-error' : 'border-surface-container-highest'
                  }`}
                />
              </div>
              {passwordError && (
                <p className="text-error text-[11px] pl-xs mt-1">{passwordError}</p>
              )}
            </div>

            {/* Recordar */}
            <div className="flex items-center gap-sm px-xs">
              <input
                id="remember"
                type="checkbox"
                checked={recordar}
                onChange={e => setRecordar(e.target.checked)}
                className="w-4 h-4 rounded border-surface-container-highest bg-surface-container-highest accent-[#f27a18]"
              />
              <label htmlFor="remember" className="text-body-md text-on-surface-variant cursor-pointer">
                Recordar en este dispositivo
              </label>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-primary-container text-white font-semibold py-md rounded-lg shadow-lg hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-sm disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {cargando ? (
                <>
                  <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  Ingresando...
                </>
              ) : (
                <>
                  <span>Ingresar al Panel</span>
                  <span className="material-symbols-outlined">login</span>
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-body-md text-on-surface-variant">
                ¿No tienes cuenta?{' '}
                <Link
                  to="/admin/registro"
                  className="text-primary font-semibold hover:text-primary-container hover:underline transition-colors"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </form>

          <div className="mt-xl pt-lg border-t border-surface-container-highest text-center">
            <p className="text-body-md text-on-surface-variant">
              ¿Necesita soporte técnico?{' '}
              <a href="mailto:soporte@laterrazadelmar.com" className="text-primary font-semibold hover:underline">
                Contactar soporte
              </a>
            </p>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="mt-lg grid grid-cols-3 gap-md opacity-60">
          {[
            { valor: '24/7', etiqueta: 'Monitoreo' },
            { valor: '99.9%', etiqueta: 'Uptime' },
            { valor: 'SSL', etiqueta: 'Cifrado' },
          ].map(stat => (
            <div
              key={stat.etiqueta}
              className="bg-surface-container-low/50 border border-surface-container-highest rounded-lg p-sm text-center"
            >
              <div className="text-primary font-bold text-headline-sm">{stat.valor}</div>
              <div className="text-[10px] text-outline uppercase tracking-widest">{stat.etiqueta}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-lg left-1/2 -translate-x-1/2 flex items-center gap-xl text-outline text-[11px] uppercase tracking-widest whitespace-nowrap">
        <a href="#" className="hover:text-on-surface transition-colors">Términos de Servicio</a>
        <a href="#" className="hover:text-on-surface transition-colors">Política de Privacidad</a>
        <span>© 2024 La Terraza del Mar</span>
      </div>
    </div>
  );
}
