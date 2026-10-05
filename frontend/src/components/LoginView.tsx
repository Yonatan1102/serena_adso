import React, { useEffect, useState } from 'react';
import { ArrowLeft, CheckCircle2, ShieldCheck } from 'lucide-react';
import { RecaptchaV2 } from './RecaptchaV2';
import { serenaApi } from '../services/serena-api.service';
import { FichaRegistro, Programa } from '../types/serena.types';

interface LoginResponseUser {
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  centro: 'CMTC' | 'CMM' | 'CEET';
  num_ficha?: string;
  id_ficha?: number;
  avatar_url?: string;
  telefono?: string;
  especialidad?: string;
  programa_formacion?: string;
  jornada?: string;
  estado_formativo?: string;
  documento?: string;
  email_verificado?: boolean;
}

interface LoginViewProps {
  onLogin: (usuario: LoginResponseUser, token: string) => void;
}

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-500 focus:ring-4 focus:ring-violet-100';

export function LoginView({ onLogin }: LoginViewProps) {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'aprendiz' | 'psicosocial'>('aprendiz');
  const [programas, setProgramas] = useState<Programa[]>([]);
  const [fichas, setFichas] = useState<FichaRegistro[]>([]);
  const [programaId, setProgramaId] = useState('');
  const [fichaId, setFichaId] = useState('');
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [documento, setDocumento] = useState('');
  const [aceptaTratamiento, setAceptaTratamiento] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [captchaInstance, setCaptchaInstance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [catalogError, setCatalogError] = useState('');

  useEffect(() => {
    if (!isRegistering) return;
    let active = true;
    serenaApi.getProgramasDesdeApi()
      .then((items) => {
        if (active) {
          setProgramas(items);
          setCatalogError(items.length ? '' : 'Aún no hay programas con fichas activas disponibles.');
        }
      })
      .catch((reason: unknown) => {
        if (active) setCatalogError(reason instanceof Error ? reason.message : 'No se pudieron cargar los programas.');
      });
    return () => { active = false; };
  }, [isRegistering]);

  useEffect(() => {
    if (!programaId) {
      setFichas([]);
      setFichaId('');
      return;
    }
    let active = true;
    setFichas([]);
    setFichaId('');
    serenaApi.getFichasDeProgramaDesdeApi(Number(programaId))
      .then((items) => { if (active) setFichas(items); })
      .catch((reason: unknown) => {
        if (active) setCatalogError(reason instanceof Error ? reason.message : 'No se pudieron cargar las fichas.');
      });
    return () => { active = false; };
  }, [programaId]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const resetCaptcha = () => {
    setRecaptchaToken('');
    setCaptchaInstance((value) => value + 1);
  };

  const toggleMode = () => {
    setIsRegistering((value) => !value);
    setIsVerifyingEmail(false);
    setCodigo('');
    setContrasena('');
    setConfirmarContrasena('');
    setAceptaTratamiento(false);
    setCatalogError('');
    clearMessages();
    resetCaptcha();
  };

  const handleAuth = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    clearMessages();

    if (!recaptchaToken) {
      setError('Completa la verificación reCAPTCHA para continuar.');
      return;
    }
    if (!correo.trim() || !contrasena) {
      setError('Ingresa tu correo institucional y contraseña.');
      return;
    }
    if (isRegistering) {
      const domain = rol === 'aprendiz' ? '@soy.sena.edu.co' : '@sena.edu.co';
      if (!correo.trim().toLowerCase().endsWith(domain)) {
        setError(rol === 'aprendiz'
          ? 'El correo de aprendiz debe terminar en @soy.sena.edu.co.'
          : 'El correo psicosocial debe terminar en @sena.edu.co.');
        return;
      }
      if (!nombre.trim() || contrasena.length < 8 || contrasena !== confirmarContrasena) {
        setError(!nombre.trim()
          ? 'Escribe tu nombre completo.'
          : contrasena.length < 8
            ? 'La contraseña debe tener al menos 8 caracteres.'
            : 'Las contraseñas no coinciden.');
        return;
      }
      if (rol === 'aprendiz' && (!programaId || !fichaId)) {
        setError('Selecciona un programa y una ficha asociada.');
        return;
      }
      if (!aceptaTratamiento) {
        setError('Debes aceptar Habeas Data, el Tratamiento de Datos Personales y el Tratado de Confidencialidad.');
        return;
      }
    }

    setLoading(true);
    try {
      const response = await fetch(isRegistering ? '/api/Login/registrar' : '/api/Login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegistering
          ? {
              nombre_usuario: nombre.trim(),
              email: correo.trim(),
              contrasena,
              id_rol: rol === 'psicosocial' ? 2 : 1,
              id_programa: rol === 'aprendiz' ? Number(programaId) : null,
              id_ficha: rol === 'aprendiz' ? Number(fichaId) : null,
              documento: documento.trim(),
              acepta_tratamiento_datos: aceptaTratamiento,
              recaptchaToken,
            }
          : { correo: correo.trim(), contrasena, recaptchaToken }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.detail || payload?.mensaje || 'No fue posible procesar la solicitud.');

      if (isRegistering) {
        setIsVerifyingEmail(true);
        setSuccess(payload?.mensaje || 'Ingresa el código temporal enviado a tu correo institucional.');
        setContrasena('');
        setConfirmarContrasena('');
        setAceptaTratamiento(false);
        return;
      }

      const usuario = payload?.usuario ?? payload?.data?.usuario;
      const token = payload?.token ?? payload?.data?.token;
      if (!usuario || !token) throw new Error('La respuesta del servidor no incluye usuario o token.');
      onLogin(usuario, token);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  const handleVerificationRequest = async (resend: boolean) => {
    clearMessages();
    if (!recaptchaToken) {
      setError('Completa reCAPTCHA antes de continuar.');
      return;
    }
    if (!resend && !/^\d{6}$/.test(codigo)) {
      setError('Ingresa el código numérico de seis dígitos.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`/api/Login/${resend ? 'reenviar-verificacion' : 'verificar-correo'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: correo.trim(),
          ...(resend ? {} : { codigo }),
          recaptchaToken,
        }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload?.detail || payload?.mensaje || 'No fue posible verificar el correo.');
      if (resend) setSuccess(payload?.mensaje || 'Si la cuenta está pendiente, se enviará otro código.');
      else {
        setIsVerifyingEmail(false);
        setIsRegistering(false);
        setCodigo('');
        setSuccess('Correo verificado. Ya puedes iniciar sesión.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
      resetCaptcha();
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f8f5ff] px-4 py-8">
      <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-violet-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-20 h-96 w-96 animate-[pulse_10s_ease-in-out_infinite] rounded-full bg-fuchsia-100/70 blur-3xl" />
      <section className="relative w-full max-w-lg animate-[fadeIn_450ms_ease-out] rounded-3xl border border-white bg-white/90 p-6 shadow-[0_28px_90px_rgba(76,29,149,0.16)] backdrop-blur sm:p-9">
        <header className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 p-2.5">
            <img src="/IMG/logo.png" alt="Logo de SERENA" className="h-full w-full object-contain" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-violet-700">SERENA</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {isVerifyingEmail ? 'Verifica tu correo' : isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isVerifyingEmail
              ? `Enviamos un código temporal a ${correo}.`
              : 'Accede a tu espacio de bienestar y acompañamiento.'}
          </p>
        </header>

        {isVerifyingEmail ? (
          <div className="space-y-5">
            <label className="block text-sm font-medium text-slate-700" htmlFor="otp-code">Código de seis dígitos</label>
            <input
              id="otp-code"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              onChange={(event) => setCodigo(event.target.value.replace(/\D/g, '').slice(0, 6))}
              className={`${inputClass} text-center text-2xl font-bold tracking-[0.45em]`}
              placeholder="000000"
            />
            <p className="text-xs text-slate-500">El código vence en 10 minutos. Tras cinco intentos fallidos, solicita otro.</p>
            <div className="flex justify-center"><RecaptchaV2 key={`otp-${captchaInstance}`} onToken={setRecaptchaToken} /></div>
            {error && <Message tone="error">{error}</Message>}
            {success && <Message tone="success">{success}</Message>}
            <button type="button" disabled={loading} onClick={() => void handleVerificationRequest(false)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white transition hover:bg-violet-600 disabled:opacity-60">
              <CheckCircle2 className="h-4 w-4" /> {loading ? 'Verificando...' : 'Verificar correo'}
            </button>
            <button type="button" disabled={loading} onClick={() => void handleVerificationRequest(true)} className="w-full text-sm font-semibold text-violet-700 hover:text-violet-900 disabled:opacity-60">
              Reenviar código
            </button>
          </div>
        ) : (
          <form onSubmit={(event) => void handleAuth(event)} className="space-y-4">
            {isRegistering && (
              <>
                <Field id="nombre" label="Nombre completo" value={nombre} onChange={setNombre} placeholder="Tu nombre" />
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="rol">Tipo de cuenta</label>
                  <select id="rol" value={rol} onChange={(event) => setRol(event.target.value as typeof rol)} className={inputClass}>
                    <option value="aprendiz">Aprendiz</option>
                    <option value="psicosocial">Profesional psicosocial</option>
                  </select>
                </div>
                {rol === 'aprendiz' && (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="programa">Programa de formación</label>
                      <select id="programa" value={programaId} onChange={(event) => setProgramaId(event.target.value)} className={inputClass} required>
                        <option value="">Selecciona un programa</option>
                        {programas.map((item) => <option key={item.id_programa} value={item.id_programa}>{item.nombre_programa}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="ficha">Ficha disponible</label>
                      <select id="ficha" value={fichaId} onChange={(event) => setFichaId(event.target.value)} className={inputClass} required disabled={!programaId || fichas.length === 0}>
                        <option value="">{programaId ? 'Selecciona una ficha' : 'Primero selecciona el programa'}</option>
                        {fichas.map((item) => <option key={item.id_ficha} value={item.id_ficha}>{item.codigo_ficha}{item.jornada ? ` · ${item.jornada}` : ''}</option>)}
                      </select>
                    </div>
                  </>
                )}
                <Field id="documento" label="Documento de identidad" value={documento} onChange={setDocumento} placeholder="Número de documento" inputMode="numeric" />
                {catalogError && <Message tone="error">{catalogError}</Message>}
              </>
            )}

            <Field id="correo" label="Correo institucional" value={correo} onChange={setCorreo} placeholder={isRegistering && rol === 'aprendiz' ? 'usuario@soy.sena.edu.co' : 'usuario@sena.edu.co'} type="email" autoComplete="email" />
            <Field id="contrasena" label="Contraseña" value={contrasena} onChange={setContrasena} placeholder={isRegistering ? 'Mínimo 8 caracteres' : 'Tu contraseña'} type="password" autoComplete={isRegistering ? 'new-password' : 'current-password'} />
            {isRegistering && (
              <>
                <Field id="confirmar" label="Confirmar contraseña" value={confirmarContrasena} onChange={setConfirmarContrasena} placeholder="Repite tu contraseña" type="password" autoComplete="new-password" />
                <label className="flex items-start gap-2 text-xs leading-relaxed text-slate-600">
                  <input type="checkbox" checked={aceptaTratamiento} onChange={(event) => setAceptaTratamiento(event.target.checked)} className="mt-0.5 accent-violet-700" />
                  <span>Acepto los términos de Habeas Data, el Tratamiento de Datos Personales y el Tratado de Confidencialidad.</span>
                </label>
              </>
            )}
            <div className="flex justify-center py-1"><RecaptchaV2 key={`auth-${captchaInstance}`} onToken={setRecaptchaToken} /></div>
            {error && <Message tone="error">{error}</Message>}
            {success && <Message tone="success">{success}</Message>}
            {catalogError && !isRegistering && <Message tone="error">{catalogError}</Message>}
            <button type="submit" disabled={loading || (isRegistering && rol === 'aprendiz' && !programas.length)} className="flex w-full items-center justify-center gap-2 rounded-xl bg-violet-700 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60">
              <ShieldCheck className="h-4 w-4" /> {loading ? 'Procesando...' : isRegistering ? 'Crear cuenta y enviar código' : 'Ingresar'}
            </button>
          </form>
        )}

        <footer className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
          {isVerifyingEmail ? (
            <button type="button" onClick={() => { setIsVerifyingEmail(false); setIsRegistering(false); clearMessages(); }} className="inline-flex items-center gap-1 font-semibold text-violet-700 hover:text-violet-900">
              <ArrowLeft className="h-4 w-4" /> Volver a iniciar sesión
            </button>
          ) : (
            <>
              <span className="text-slate-500">{isRegistering ? '¿Ya tienes una cuenta?' : '¿No tienes cuenta?'}</span>
              <button type="button" onClick={toggleMode} className="font-semibold text-violet-700 hover:text-violet-900">
                {isRegistering ? 'Inicia sesión' : 'Regístrate'}
              </button>
            </>
          )}
        </footer>
      </section>
      <style>{'@keyframes fadeIn { from { opacity: 0; transform: translateY(10px) scale(.99); } to { opacity: 1; transform: translateY(0) scale(1); } }'}</style>
    </main>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  inputMode?: 'numeric';
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-slate-700">{label}</label>
      <input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} autoComplete={autoComplete} inputMode={inputMode} className={inputClass} placeholder={placeholder} />
    </div>
  );
}

function Message({ tone, children }: { tone: 'error' | 'success'; children: React.ReactNode }) {
  return (
    <p role={tone === 'error' ? 'alert' : 'status'} className={`rounded-xl border px-3 py-2 text-sm ${tone === 'error' ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
      {children}
    </p>
  );
}
