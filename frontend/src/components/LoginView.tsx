import React, { useState } from 'react';
import $ from 'jquery';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

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

export function LoginView({ onLogin }: LoginViewProps) {
  const [correo, setCorreo] = useState('yacuna@soy.sena.edu.co');
  const [contrasena, setContrasena] = useState('Aa12345*');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    if (!correo.trim() || !contrasena.trim()) {
      setError('Debe ingresar correo y contraseña.');
      return;
    }

    const loginUrl = API_BASE_URL ? `${API_BASE_URL}/api/Login` : '/api/Login';
    setIsLoading(true);

    $.ajax({
      url: loginUrl,
      method: 'POST',
      data: JSON.stringify({ correo, contrasena }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      crossDomain: false,
      xhrFields: { withCredentials: false },
      success: (response: any) => {
        const usuario = response?.usuario ?? response?.data?.usuario ?? response;
        const token = response?.token ?? response?.data?.token;

        if (!usuario || !token) {
          setError('La respuesta del servidor no incluye usuario o token.');
          setIsLoading(false);
          return;
        }

        localStorage.setItem('serena_current_user', JSON.stringify(usuario));
        localStorage.setItem('serena_access_token', token);
        localStorage.setItem('serena_auth_token', token);
        onLogin(usuario, token);
        setIsLoading(false);
      },
      error: (xhr: JQuery.jqXHR, status: string, errorThrown: string) => {
        const message =
          xhr?.responseJSON?.mensaje ||
          xhr?.responseText ||
          status === 'error' && errorThrown
            ? errorThrown
            : 'No se pudo iniciar sesión.';

        setError(message || 'No se pudo iniciar sesión.');
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f172a] text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.32),_rgba(15,23,42,0.94)_48%,_rgba(2,6,23,1)_100%)]" />
      <img
        src="/IMG/logo.png"
        alt="SERENA logo"
        className="pointer-events-none absolute inset-x-0 top-8 mx-auto h-[260px] w-[260px] object-contain opacity-20 drop-shadow-[0_0_18px_rgba(167,139,250,0.8)]"
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center p-6">
        <div className="w-full max-w-md rounded-3xl border border-emerald-100/50 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur-sm">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center overflow-hidden rounded-2xl bg-emerald-100/80 p-2 shadow-sm ring-4 ring-white/60">
              <img src="/IMG/logo.png" alt="SERENA" className="h-full w-full object-contain" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700">SERENA</p>
            <h1 className="mt-3 text-3xl font-extrabold text-slate-900">Iniciar sesión</h1>
            <p className="mt-2 text-sm text-slate-500">Accede a tu bienestar emocional y acompañamiento SENA.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="correo" className="mb-2 block text-sm font-medium text-slate-700">Correo institucional</label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(e) => setCorreo(e.target.value)}
                autoComplete="email"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="tu.correo@sena.edu.co"
              />
            </div>

            <div>
              <label htmlFor="contrasena" className="mb-2 block text-sm font-medium text-slate-700">Contraseña</label>
              <input
                id="contrasena"
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                placeholder="********"
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-emerald-600 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isLoading ? 'Iniciando sesión...' : 'Ingresar'}
            </button>
          </form>

          <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
            <p className="font-semibold text-slate-700">Credenciales de prueba:</p>
            <p className="mt-2">Aprendiz: yacuna@soy.sena.edu.co / Aa12345*</p>
            <p>Psicólogo: lmartinez@sena.edu.co / Aa12345*</p>
          </div>
        </div>
      </div>
    </div>
  );
}