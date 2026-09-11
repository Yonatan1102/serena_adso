import React, { useState } from 'react';
import $ from 'jquery';

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

    setIsLoading(true);

    $.ajax({
      url: 'http://localhost:5185/api/Login',
      method: 'POST',
      data: JSON.stringify({ correo, contrasena }),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      xhrFields: { withCredentials: false },
      success: (response) => {
        const usuario = response?.usuario ?? response?.data?.usuario;
        const token = response?.token ?? response?.data?.token;

        if (!usuario || !token) {
          setError('La respuesta del servidor no incluye usuario o token.');
          setIsLoading(false);
          return;
        }

        onLogin(usuario, token);
        setIsLoading(false);
      },
      error: (xhr) => {
        const message = xhr?.responseJSON?.mensaje || 'No se pudo iniciar sesión.';
        setError(message);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5,_#f8fafc_45%,_#eef2ff)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-emerald-100 bg-white/90 p-8 shadow-[0_30px_80px_rgba(15,23,42,0.10)] backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-3xl shadow-sm">💚</div>
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
  );
}
