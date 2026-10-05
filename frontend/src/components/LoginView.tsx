import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, UserPlus } from 'lucide-react';
import { Usuario } from '../types/serena.types';
import { RecaptchaV2 } from './RecaptchaV2';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100';

type View = 'login' | 'register' | 'verify';
type AccountRole = 1 | 2;

interface LoginViewProps {
  onLogin: (usuario: Usuario, token: string) => void;
}

interface ProgramaOption {
  id_programa: number;
  nombre_programa: string;
}

interface FichaOption {
  id_ficha: number;
  codigo_ficha: string;
  jornada: string;
}

class ApiRequestError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
  }
}

async function requestApi<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(
      result?.mensaje || result?.detail || result?.title || 'No fue posible completar la solicitud.',
      response.status,
    );
  }
  return result as T;
}

export function LoginView({ onLogin }: LoginViewProps) {
  const [view, setView] = useState<View>('login');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [codigo, setCodigo] = useState('');
  const [rol, setRol] = useState<AccountRole>(1);
  const [documento, setDocumento] = useState('');
  const [programas, setProgramas] = useState<ProgramaOption[]>([]);
  const [fichas, setFichas] = useState<FichaOption[]>([]);
  const [programaId, setProgramaId] = useState('');
  const [fichaId, setFichaId] = useState('');
  const [aceptaTratamiento, setAceptaTratamiento] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [recaptchaVersion, setRecaptchaVersion] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [showPrivacy, setShowPrivacy] = useState(false);

  useEffect(() => {
    if (view !== 'register') return;
    let active = true;
    fetch(`${API_BASE_URL}/programas`)
      .then(async (response) => {
        if (!response.ok) throw new Error('No fue posible cargar los programas.');
        return response.json() as Promise<ProgramaOption[]>;
      })
      .then((items) => { if (active) setProgramas(items); })
      .catch((cause: Error) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [view]);

  useEffect(() => {
    if (view !== 'register' || rol !== 1 || !programaId) {
      setFichas([]);
      setFichaId('');
      return;
    }
    let active = true;
    fetch(`${API_BASE_URL}/programas/${programaId}/fichas`)
      .then(async (response) => {
        if (!response.ok) throw new Error('No fue posible cargar las fichas.');
        return response.json() as Promise<FichaOption[]>;
      })
      .then((items) => { if (active) setFichas(items); })
      .catch((cause: Error) => { if (active) setError(cause.message); });
    return () => { active = false; };
  }, [view, rol, programaId]);

  const resetCaptcha = () => {
    setRecaptchaToken('');
    setRecaptchaVersion((version) => version + 1);
  };

  const changeView = (nextView: View) => {
    setView(nextView);
    setError('');
    setNotice('');
    setRecaptchaToken('');
  };

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!recaptchaToken) {
      setError('Completa la verificación reCAPTCHA.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await requestApi<{ usuario: Usuario; token: string }>('/Login', {
        correo: correo.trim(), contrasena, recaptchaToken,
      });
      onLogin(response.usuario, response.token);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo iniciar sesión.');
    } finally {
      setIsLoading(false);
      resetCaptcha();
    }
  };

  const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!aceptaTratamiento) {
      setError('Debes aceptar el aviso de privacidad para crear la cuenta.');
      return;
    }
    if (!recaptchaToken) {
      setError('Completa la verificación reCAPTCHA.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await requestApi<{ mensaje: string; correo: string }>('/Login/registrar', {
        nombre_usuario: nombre.trim(),
        email: correo.trim(),
        contrasena,
        id_rol: rol,
        id_programa: rol === 1 ? Number(programaId) : null,
        id_ficha: rol === 1 ? Number(fichaId) : null,
        documento: documento.trim() || null,
        acepta_tratamiento_datos: true,
        recaptchaToken,
      });
      setCorreo(response.correo || correo.trim());
      setContrasena('');
      setCodigo('');
      setNotice(response.mensaje || 'Cuenta creada. Revisa tu correo institucional.');
      setView('verify');
    } catch (cause) {
      if (cause instanceof ApiRequestError && cause.status === 503) {
        setCorreo(correo.trim());
        setContrasena('');
        setCodigo('');
        setView('verify');
        setNotice('La cuenta quedó creada, pero el correo no pudo enviarse. Corrige la configuración de correo y luego solicita un nuevo código.');
        return;
      }
      setError(cause instanceof Error ? cause.message : 'No se pudo crear la cuenta.');
    } finally {
      setIsLoading(false);
      resetCaptcha();
    }
  };

  const handleVerify = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    if (!recaptchaToken) {
      setError('Completa la verificación reCAPTCHA.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await requestApi<{ mensaje: string }>('/Login/verificar-correo', {
        email: correo.trim(), codigo: codigo.trim(), recaptchaToken,
      });
      setNotice(response.mensaje || 'Correo verificado. Ya puedes iniciar sesión.');
      setContrasena('');
      setView('login');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo verificar el correo.');
    } finally {
      setIsLoading(false);
      resetCaptcha();
    }
  };

  const handleResendCode = async () => {
    setError('');
    if (!recaptchaToken) {
      setError('Completa la verificación reCAPTCHA para reenviar el código.');
      return;
    }
    setIsLoading(true);
    try {
      const response = await requestApi<{ mensaje: string }>('/Login/reenviar-verificacion', {
        email: correo.trim(), recaptchaToken,
      });
      setNotice(response.mensaje || 'Si la cuenta está pendiente, se enviará un nuevo código.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo reenviar el código.');
    } finally {
      setIsLoading(false);
      resetCaptcha();
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f5f1fb] text-slate-900">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_12%_12%,rgba(124,58,237,0.13),transparent_36%),radial-gradient(ellipse_at_90%_84%,rgba(192,132,252,0.18),transparent_32%)]" />
      <div className="relative mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-4 py-8 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12">
        <section className="hidden lg:block">
          <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-violet-100">
            <img src="/IMG/logo.png" alt="SERENA" className="h-16 w-16 object-contain" />
          </div>
          <p className="text-sm font-semibold uppercase text-violet-700">SENA · CMTC</p>
          <h1 className="mt-3 max-w-md text-4xl font-bold leading-tight text-[#2d1748]">SERENA</h1>
          <p className="mt-3 max-w-sm text-base leading-7 text-slate-600">Acceso institucional para aprendices y profesionales psicosociales.</p>
          <div className="mt-10 h-1 w-16 rounded-full bg-violet-600" />
        </section>

        <section className="mx-auto w-full max-w-lg rounded-2xl border border-violet-100 bg-white p-5 shadow-[0_24px_70px_rgba(57,31,84,0.12)] sm:p-8">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-50">
              <img src="/IMG/logo.png" alt="SERENA" className="h-10 w-10 object-contain" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#2d1748]">SERENA</p>
              <p className="text-xs text-slate-500">SENA · CMTC</p>
            </div>
          </div>

          {view !== 'verify' && (
            <div className="mb-7 grid grid-cols-2 rounded-xl bg-violet-50 p-1" role="tablist" aria-label="Acceso a SERENA">
              <button type="button" role="tab" aria-selected={view === 'login'} onClick={() => changeView('login')} className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${view === 'login' ? 'bg-white text-violet-800 shadow-sm' : 'text-violet-600 hover:text-violet-900'}`}>
                Iniciar sesión
              </button>
              <button type="button" role="tab" aria-selected={view === 'register'} onClick={() => changeView('register')} className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition ${view === 'register' ? 'bg-white text-violet-800 shadow-sm' : 'text-violet-600 hover:text-violet-900'}`}>
                <UserPlus size={16} /> Crear cuenta
              </button>
            </div>
          )}

          <div className="mb-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700">
              {view === 'verify' ? <ShieldCheck size={19} /> : view === 'register' ? <UserPlus size={19} /> : <ShieldCheck size={19} />}
            </div>
            <h2 className="text-2xl font-bold text-[#2d1748]">
              {view === 'login' ? 'Bienvenido de nuevo' : view === 'register' ? 'Crear cuenta institucional' : 'Verifica tu correo'}
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {view === 'login' ? 'Ingresa con las credenciales registradas en SERENA.' : view === 'register' ? 'Elige el tipo de cuenta que corresponde a tu correo SENA.' : `Ingresa el código de seis dígitos enviado a ${correo}.`}
            </p>
          </div>

          {notice && <p role="status" className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">{notice}</p>}
          {error && <p role="alert" className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">{error}</p>}

          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="correo-login" className="mb-1.5 block text-sm font-medium text-slate-700">Correo institucional</label>
                <input id="correo-login" className={inputClass} type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} autoComplete="username" placeholder="nombre@soy.sena.edu.co" required />
              </div>
              <div>
                <label htmlFor="contrasena-login" className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</label>
                <input id="contrasena-login" className={inputClass} type="password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} autoComplete="current-password" placeholder="Tu contraseña" required />
              </div>
              <RecaptchaV2 key={recaptchaVersion} onToken={setRecaptchaToken} />
              <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'Validando…' : 'Ingresar'}
              </button>
            </form>
          )}

          {view === 'register' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <fieldset>
                <legend className="mb-2 text-sm font-medium text-slate-700">Tipo de cuenta</legend>
                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setRol(1)} aria-pressed={rol === 1} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${rol === 1 ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-600 hover:border-violet-200'}`}>Aprendiz</button>
                  <button type="button" onClick={() => setRol(2)} aria-pressed={rol === 2} className={`rounded-lg border px-3 py-2.5 text-sm font-semibold transition ${rol === 2 ? 'border-violet-500 bg-violet-50 text-violet-800' : 'border-slate-200 text-slate-600 hover:border-violet-200'}`}>Psicosocial</button>
                </div>
              </fieldset>
              <div>
                <label htmlFor="nombre-registro" className="mb-1.5 block text-sm font-medium text-slate-700">Nombre completo</label>
                <input id="nombre-registro" className={inputClass} value={nombre} onChange={(event) => setNombre(event.target.value)} autoComplete="name" required maxLength={50} />
              </div>
              <div>
                <label htmlFor="correo-registro" className="mb-1.5 block text-sm font-medium text-slate-700">Correo institucional</label>
                <input id="correo-registro" className={inputClass} type="email" value={correo} onChange={(event) => setCorreo(event.target.value)} autoComplete="email" placeholder={rol === 1 ? 'nombre@soy.sena.edu.co' : 'nombre@sena.edu.co'} required maxLength={150} />
              </div>
              <div>
                <label htmlFor="contrasena-registro" className="mb-1.5 block text-sm font-medium text-slate-700">Contraseña</label>
                <input id="contrasena-registro" className={inputClass} type="password" value={contrasena} onChange={(event) => setContrasena(event.target.value)} autoComplete="new-password" minLength={8} required />
              </div>
              {rol === 1 && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="programa-registro" className="mb-1.5 block text-sm font-medium text-slate-700">Programa</label>
                    <select id="programa-registro" className={inputClass} value={programaId} onChange={(event) => { setProgramaId(event.target.value); setFichaId(''); }} required>
                      <option value="">Selecciona un programa</option>
                      {programas.map((item) => <option key={item.id_programa} value={item.id_programa}>{item.nombre_programa}</option>)}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="ficha-registro" className="mb-1.5 block text-sm font-medium text-slate-700">Ficha</label>
                    <select id="ficha-registro" className={inputClass} value={fichaId} onChange={(event) => setFichaId(event.target.value)} required disabled={!programaId || fichas.length === 0}>
                      <option value="">{programaId ? 'Selecciona una ficha' : 'Primero elige el programa'}</option>
                      {fichas.map((item) => <option key={item.id_ficha} value={item.id_ficha}>{item.codigo_ficha}{item.jornada ? ` · ${item.jornada}` : ''}</option>)}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="documento-registro" className="mb-1.5 block text-sm font-medium text-slate-700">Documento <span className="font-normal text-slate-400">(opcional)</span></label>
                    <input id="documento-registro" className={inputClass} value={documento} onChange={(event) => setDocumento(event.target.value)} maxLength={30} />
                  </div>
                </div>
              )}
              <div className="rounded-lg bg-violet-50/80 p-3.5">
                <label className="flex items-start gap-2.5 text-sm leading-5 text-slate-700">
                  <input type="checkbox" checked={aceptaTratamiento} onChange={(event) => setAceptaTratamiento(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-violet-700" />
                  <span>He leído el <button type="button" onClick={() => setShowPrivacy(true)} className="font-semibold text-violet-800 underline decoration-violet-300 underline-offset-2 hover:text-violet-950">aviso de privacidad</button> y autorizo el tratamiento necesario para crear y gestionar mi cuenta.</span>
                </label>
              </div>
              <RecaptchaV2 key={recaptchaVersion} onToken={setRecaptchaToken} />
              <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'Creando cuenta…' : 'Crear cuenta'}
              </button>
            </form>
          )}

          {view === 'verify' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label htmlFor="codigo-verificacion" className="mb-1.5 block text-sm font-medium text-slate-700">Código de verificación</label>
                <input id="codigo-verificacion" className={`${inputClass} text-center text-lg tracking-[0.3em]`} value={codigo} onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="000000" required minLength={6} maxLength={6} />
              </div>
              <RecaptchaV2 key={recaptchaVersion} onToken={setRecaptchaToken} />
              <button type="submit" disabled={isLoading} className="w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">
                {isLoading ? 'Verificando…' : 'Verificar correo'}
              </button>
              <button type="button" disabled={isLoading} onClick={handleResendCode} className="w-full py-2 text-sm font-semibold text-violet-800 hover:text-violet-950 disabled:opacity-50">Reenviar código</button>
              <button type="button" onClick={() => changeView('login')} className="flex w-full items-center justify-center gap-2 py-1 text-sm text-slate-500 hover:text-slate-800"><ArrowLeft size={15} /> Volver al inicio de sesión</button>
            </form>
          )}

          <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs leading-5 text-slate-500">Las cuentas de administrador se aprovisionan directamente en la base de datos y no se crean desde esta pantalla.</p>
        </section>
      </div>

      {showPrivacy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowPrivacy(false); }}>
          <section role="dialog" aria-modal="true" aria-labelledby="privacy-title" className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <p className="text-xs font-semibold uppercase text-violet-700">SERENA · SENA</p>
            <h2 id="privacy-title" className="mt-2 text-xl font-bold text-[#2d1748]">Aviso de privacidad y tratamiento de datos</h2>
            <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <p>Para crear y proteger tu cuenta se tratarán tu nombre, correo institucional, contraseña almacenada como hash y, si eres aprendiz, el programa y la ficha seleccionados. El correo se usa para verificar la cuenta y enviarte comunicaciones necesarias del servicio.</p>
              <p>Al usar las funciones de acompañamiento puedes aportar información relacionada con tu bienestar emocional. Estos datos son sensibles y se tratarán con acceso restringido para prestar las funciones solicitadas, de acuerdo con la normativa colombiana de protección de datos personales.</p>
              <p>Puedes solicitar información sobre el tratamiento o ejercer tus derechos de consulta, actualización, rectificación y supresión ante el responsable institucional de protección de datos del SENA.</p>
              <p className="rounded-lg bg-violet-50 p-3 text-xs text-violet-950">La aceptación se registra con fecha y hora. La política institucional completa y su canal oficial de contacto deben estar disponibles para los usuarios antes del despliegue productivo.</p>
            </div>
            <button type="button" onClick={() => setShowPrivacy(false)} className="mt-6 w-full rounded-lg bg-violet-700 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-800">Cerrar aviso</button>
          </section>
        </div>
      )}
    </main>
  );
}