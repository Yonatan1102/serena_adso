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
  const [isRegistering, setIsRegistering] = useState(false);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('demo@serena.local');
  const [contrasena, setContrasena] = useState('Demo123*');
  const [confirmarContrasena, setConfirmarContrasena] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (isRegistering && !nombre.trim()) {
      setError('Debe ingresar su nombre.');
      return;
    }

    if (!correo.trim() || !contrasena.trim()) {
      setError('Debe ingresar correo y contraseña.');
      return;
    }

    if (isRegistering && contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }

    if (isRegistering && contrasena !== confirmarContrasena) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    $.ajax({
      url: isRegistering ? '/api/Login/registrar' : '/api/Login',
      method: 'POST',
      data: JSON.stringify(
        isRegistering
          ? { nombre_usuario: nombre, email: correo, contrasena, id_rol: 1 }
          : { correo, contrasena },
      ),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      xhrFields: { withCredentials: false },
      success: (response) => {
        if (isRegistering) {
          setIsRegistering(false);
          setNombre('');
          setConfirmarContrasena('');
          setSuccess('Registro exitoso. Ahora puedes iniciar sesión.');
          setIsLoading(false);
          return;
        }

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
        const message = xhr?.responseJSON?.mensaje || (
          isRegistering ? 'No se pudo completar el registro.' : 'No se pudo iniciar sesión.'
        );
        setError(message);
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f3e8ff,_#faf5ff_45%,_#ede9fe)] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white/90 p-8 shadow-[0_30px_80px_rgba(76,29,149,0.14)] backdrop-blur-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-100 p-3 shadow-sm">
            <img src="/IMG/logo.png" alt="Logo de SERENA" className="h-full w-full object-contain" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-violet-700">SERENA</p>
          <h1 className="mt-3 text-3xl font-extrabold text-slate-900">
            {isRegistering ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {isRegistering
              ? 'Regístrate para acceder al acompañamiento SENA.'
              : 'Accede a tu bienestar emocional y acompañamiento SENA.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && (
            <div>
              <label htmlFor="nombre" className="mb-2 block text-sm font-medium text-slate-700">Nombre completo</label>
              <input
                id="nombre"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                autoComplete="name"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                placeholder="Tu nombre completo"
              />
            </div>
          )}

          <div>
            <label htmlFor="correo" className="mb-2 block text-sm font-medium text-slate-700">Correo institucional</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              autoComplete="email"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
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
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
              placeholder="********"
            />
          </div>

          {isRegistering && (
            <div>
              <label htmlFor="confirmarContrasena" className="mb-2 block text-sm font-medium text-slate-700">Confirmar contraseña</label>
              <input
                id="confirmarContrasena"
                type="password"
                value={confirmarContrasena}
                onChange={(e) => setConfirmarContrasena(e.target.value)}
                autoComplete="new-password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-violet-400 focus:bg-white focus:ring-4 focus:ring-violet-100"
                placeholder="********"
              />
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center rounded-xl bg-violet-700 px-4 py-3 text-base font-semibold text-white shadow-lg shadow-violet-700/20 transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? (isRegistering ? 'Registrando...' : 'Iniciando sesión...') : (isRegistering ? 'Registrarme' : 'Ingresar')}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setSuccess('');
          }}
          className="mt-4 w-full rounded-xl border border-violet-200 px-4 py-3 text-sm font-semibold text-violet-700 transition hover:bg-violet-50"
        >
          {isRegistering ? 'Ya tengo una cuenta' : 'Crear una cuenta'}
        </button>

        {!isRegistering && <div className="mt-6 rounded-2xl border border-violet-100 bg-violet-50/60 p-4 text-xs text-slate-600">
          <p className="font-semibold text-slate-700">Credenciales de prueba:</p>
          <p className="mt-2">Aprendiz: yacuna@soy.sena.edu.co / Aa12345*</p>
          <p>Psicólogo: lmartinez@sena.edu.co / Aa12345*</p>
        </div>}
      </div>
    </div>
  );
}
