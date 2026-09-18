import React, { useState } from 'react';

interface LoginResponseUser {
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  centro: 'CMTC' | 'CMM' | 'CEET';
  num_ficha?: string;
  avatar_url?: string;
  telefono?: string;
  especialidad?: string;
  programa_formacion?: string;
  jornada?: string;
  estado_formativo?: string;
}

interface LoginViewProps {
  onLogin: (usuario: LoginResponseUser, token: string) => void;
}

const registrationSteps = ['Tu nombre', 'Tu rol', 'Tu sede', 'Tu centro', 'Tu programa', 'Tu ficha', 'Tus credenciales'];

export function LoginView({ onLogin }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationStep, setRegistrationStep] = useState(0);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'aprendiz' | 'psicologo'>('aprendiz');
  const [sede, setSede] = useState('');
  const [centro, setCentro] = useState<'CMTC' | 'CMM' | 'CEET'>('CMTC');
  const [programa, setPrograma] = useState('');
  const [ficha, setFicha] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const resetRegistration = () => {
    setIsRegistering(false);
    setRegistrationStep(0);
    setNombre('');
    setRol('aprendiz');
    setSede('');
    setCentro('CMTC');
    setPrograma('');
    setFicha('');
    setCorreo('');
    setContrasena('');
    setConfirmarContrasena('');
    setError('');
  };

  const startRegistration = () => {
    setIsRegistering(true);
    setRegistrationStep(0);
    setError('');
    setSuccess('');
  };

  const validateRegistrationStep = () => {
    if (registrationStep === 0 && !nombre.trim()) return 'Cuéntanos tu nombre completo.';
    if (registrationStep === 2 && !sede.trim()) return 'Escribe la sede a la que perteneces.';
    if (registrationStep === 4 && !programa.trim()) return 'Escribe tu programa de formación.';
    if (registrationStep === 5 && !ficha.trim()) return 'Escribe el número de tu ficha.';
    if (registrationStep === 6) {
      if (!correo.trim() || !contrasena.trim()) return 'Ingresa tu correo y contraseña.';
      if (contrasena.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
      if (contrasena !== confirmarContrasena) return 'Las contraseñas no coinciden.';
    }
    return '';
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!isRegistering) {
      if (!correo.trim() || !contrasena.trim()) {
        setError('Debe ingresar correo y contraseña.');
        return;
      }
      setIsLoading(true);
    } else {
      const validationError = validateRegistrationStep();
      if (validationError) {
        setError(validationError);
        return;
      }
      if (registrationStep < registrationSteps.length - 1) {
        setRegistrationStep((step) => step + 1);
        return;
      }
      setIsLoading(true);
    }

    try {
      const response = await fetch(isRegistering ? '/api/Login/registrar' : '/api/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          isRegistering
            ? {
                nombre_usuario: nombre.trim(),
                email: correo.trim(),
                contrasena,
                id_rol: rol === 'psicologo' ? 2 : 1,
                sede: sede.trim(),
                centro,
                programa_formacion: programa.trim(),
                num_ficha: ficha.trim(),
              }
            : { correo: correo.trim(), contrasena },
        ),
      });

      const payload = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(payload?.mensaje || (isRegistering ? 'No se pudo completar el registro.' : 'No se pudo iniciar sesión.'));
      }

      if (isRegistering) {
        resetRegistration();
        setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
        setIsLoading(false);
        return;
      }

      const usuario = payload?.usuario ?? payload?.data?.usuario;
      const token = payload?.token ?? payload?.data?.token;
      if (!usuario || !token) throw new Error('La respuesta del servidor no incluye usuario o token.');
      onLogin(usuario, token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = 'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100';

  const renderRegistrationStep = () => {
    switch (registrationStep) {
      case 0:
        return <Field id="nombre" label="¿Cómo te llamas?" value={nombre} onChange={setNombre} placeholder="Tu nombre completo" autoComplete="name" className={inputClass} />;
      case 1:
        return (
          <div>
            <label className="mb-3 block text-sm font-medium text-slate-700">¿Cuál es tu rol en SERENA?</label>
            <div className="grid gap-3 sm:grid-cols-2">
              {([['aprendiz', 'Aprendiz'], ['psicologo', 'Psicólogo']] as const).map(([value, label]) => (
                <button key={value} type="button" onClick={() => setRol(value)} className={`rounded-xl border px-4 py-4 text-left transition ${rol === value ? 'border-violet-500 bg-violet-50 text-violet-800 ring-2 ring-violet-100' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-violet-300'}`}>
                  <span className="block font-semibold">{label}</span>
                  <span className="mt-1 block text-xs text-slate-500">{value === 'aprendiz' ? 'Estoy en formación' : 'Acompaño procesos de bienestar'}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 2:
        return <Field id="sede" label="¿En qué sede estás?" value={sede} onChange={setSede} placeholder="Ej. Sede principal" className={inputClass} />;
      case 3:
        return (
          <div>
            <label htmlFor="centro" className="mb-2 block text-sm font-medium text-slate-700">Selecciona tu centro</label>
            <select id="centro" value={centro} onChange={(event) => setCentro(event.target.value as typeof centro)} className={inputClass}>
              <option value="CMTC">CMTC</option>
              <option value="CMM">CMM</option>
              <option value="CEET">CEET</option>
            </select>
          </div>
        );
      case 4:
        return <Field id="programa" label="¿Cuál es tu programa?" value={programa} onChange={setPrograma} placeholder="Ej. Análisis y Desarrollo de Software" className={inputClass} />;
      case 5:
        return <Field id="ficha" label="¿Cuál es tu número de ficha?" value={ficha} onChange={setFicha} placeholder="Ej. 3288046" inputMode="numeric" className={inputClass} />;
      default:
        return (
          <div className="space-y-5">
            <Field id="correo" label="Correo institucional" value={correo} onChange={setCorreo} placeholder="tu.correo@sena.edu.co" type="email" autoComplete="email" className={inputClass} />
            <Field id="contrasena" label="Contraseña" value={contrasena} onChange={setContrasena} placeholder="Mínimo 8 caracteres" type="password" autoComplete="new-password" className={inputClass} />
            <Field id="confirmarContrasena" label="Confirma tu contraseña" value={confirmarContrasena} onChange={setConfirmarContrasena} placeholder="Repite tu contraseña" type="password" autoComplete="new-password" className={inputClass} />
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f3e8ff,_#faf5ff_45%,_#ede9fe)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white/90 p-8 shadow-[0_30px_80px_rgba(76,29,149,0.14)] backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 p-3 shadow-sm">
            <img src="/IMG/logo.png" alt="Logo de SERENA" className="h-full w-full object-contain" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">SERENA</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">{isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}</h1>
          <p className="mt-2 text-sm text-slate-500">{isRegistering ? registrationSteps[registrationStep] : 'Accede a tu bienestar emocional y acompañamiento SENA.'}</p>
        </div>

        {isRegistering && (
          <div className="mb-6">
            <div className="mb-2 flex justify-between text-xs font-medium text-slate-500"><span>Paso {registrationStep + 1} de {registrationSteps.length}</span><span>{Math.round(((registrationStep + 1) / registrationSteps.length) * 100)}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-violet-600 transition-all duration-500" style={{ width: `${((registrationStep + 1) / registrationSteps.length) * 100}%` }} /></div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div key={`${isRegistering}-${registrationStep}`} className={isRegistering ? 'animate-[pulse_300ms_ease-out]' : ''}>
            {isRegistering ? renderRegistrationStep() : (
              <div className="space-y-5">
                <Field id="correo" label="Correo institucional" value={correo} onChange={setCorreo} placeholder="tu.correo@sena.edu.co" type="email" autoComplete="email" className={inputClass} />
                <Field id="contrasena" label="Contraseña" value={contrasena} onChange={setContrasena} placeholder="********" type="password" autoComplete="current-password" className={inputClass} />
              </div>
            )}
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
          {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</div>}

          <div className="flex gap-3">
            {isRegistering && registrationStep > 0 && <button type="button" onClick={() => { setRegistrationStep((step) => step - 1); setError(''); }} className="flex-1 rounded-xl border border-violet-200 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50">Atrás</button>}
            <button type="submit" disabled={isLoading} className="flex flex-1 items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-70">
              {isLoading ? (isRegistering ? 'Registrando...' : 'Iniciando sesión...') : (isRegistering ? (registrationStep === registrationSteps.length - 1 ? 'Crear cuenta' : 'Continuar') : 'Ingresar')}
            </button>
          </div>
        </form>

        {!isRegistering ? (
          <button type="button" onClick={startRegistration} className="mt-5 w-full text-center text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">¿No tienes cuenta? Crea una</button>
        ) : (
          <button type="button" onClick={resetRegistration} className="mt-5 w-full text-center text-sm font-semibold text-blue-600 transition hover:text-blue-700 hover:underline">Ya tengo una cuenta</button>
        )}
      </div>
    </div>
  );
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'numeric';
}

function Field({ id, label, value, onChange, placeholder, className, type = 'text', autoComplete, inputMode }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} inputMode={inputMode} className={className} placeholder={placeholder} />
    </div>
  );
}
