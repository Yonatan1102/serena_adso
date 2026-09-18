import React, { useEffect, useState } from 'react';
import {
  BookMarked,
  Lock,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Eye,
  EyeOff,
  RefreshCw,
} from 'lucide-react';
import { Usuario, Diario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface DiarioViewProps {
  currentUser: Usuario;
  aprendizSeleccionado?: Usuario; // Cuando el psicólogo inspecciona a un aprendiz
  onVolver?: () => void;
}

export const DiarioView: React.FC<DiarioViewProps> = ({
  currentUser,
  aprendizSeleccionado,
  onVolver,
}) => {
  const isPsicologo = currentUser.id_rol === 2;

  // Si es psicólogo, el usuario objetivo es el aprendiz inspeccionado
  const idObjetivo = isPsicologo
    ? aprendizSeleccionado?.id_usuario || currentUser.id_usuario
    : currentUser.id_usuario;

  const [diario, setDiario] = useState<Diario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string>('');

  const [nuevoContenido, setNuevoContenido] = useState('');
  const [compartirSp, setCompartirSp] = useState<boolean>(false);
  const [guardando, setGuardando] = useState(false);

  const cargarDiario = async () => {
    setCargando(true);
    setError('');
    try {
      const resultado = await serenaApi.getDiarioDesdeApi(idObjetivo);
      setDiario(resultado);
      if (resultado) setCompartirSp(resultado.compartir_sp);
    } catch (err) {
      setDiario(null);
      setError(err instanceof Error ? err.message : 'No se pudo cargar el diario.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    void cargarDiario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id_rol, currentUser.id_usuario, idObjetivo]);

  // El psicólogo solo ve el diario si el aprendiz lo compartió explícitamente
  const diarioVisible = isPsicologo ? Boolean(diario?.compartir_sp) : true;

  const handleGuardarActualizacion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoContenido.trim()) return;

    setGuardando(true);
    setError('');
    try {
      await serenaApi.actualizarDiarioEnApi({
        id_usuario: currentUser.id_usuario,
        contenido: nuevoContenido.trim(),
        compartir_sp: compartirSp,
      });
      setGuardando(false);
      setNuevoContenido('');
      await cargarDiario();
    } catch (err) {
      setGuardando(false);
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el diario.');
    }
  };

  const handleToggleCompartir = async () => {
    if (!diario) return;
    const nuevoValor = !diario.compartir_sp;
    try {
      const actualizado = await serenaApi.cambiarPermisoCompartirDiarioEnApi(diario, nuevoValor);
      setDiario(actualizado);
      setCompartirSp(actualizado.compartir_sp);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar el permiso.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-4 pb-12">
      {/* Cabecera del Diario */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87] font-semibold text-xs">
              Módulo de Diario Personal & Terapia
            </span>
            <span className="text-xs text-slate-400">• RF-DIA-01 & RN-02</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isPsicologo
              ? `Diario de: ${aprendizSeleccionado?.nombre_usuario || 'Aprendiz'}`
              : 'Mi Diario Personal de Bienestar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isPsicologo
              ? 'Solo se muestra el contenido si el aprendiz autorizó compartirlo de forma explícita.'
              : 'Tu diario es único y personal. Cada vez que escribas, agregarás una actualización a tu propio diario.'}
          </p>
        </div>

        {onVolver && (
          <button
            onClick={onVolver}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl cursor-pointer transition-colors"
          >
            ← Volver
          </button>
        )}
      </div>

      {/* REGLA RN-02: Aviso de Cifrado y Propiedad */}
      <div className="bg-transparent rounded-2xl p-3.5 sm:p-4 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex items-center justify-between gap-4 text-xs text-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#7E22CE]/10 text-[#7E22CE] flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-semibold text-slate-900">Privacidad y Custodia Criptográfica (RN-02)</p>
            <p className="text-slate-500 text-[11px]">
              {isPsicologo
                ? 'Si el diario no está compartido, ningún profesional puede acceder a él.'
                : 'Tú decides si tu diario es privado o si deseas que lo lea tu psicólogo asignado.'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* FORMULARIO DE ACTUALIZACIÓN (Solo para Aprendices) */}
      {!isPsicologo && (
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#7E22CE]" />
              <span>Agregar Actualización a tu Diario</span>
            </h3>
            <p className="text-xs text-slate-400">
              Lo que escribas se añadirá a tu diario (que es uno solo). Nadie podrá leerlo a menos que actives la casilla de compartir.
            </p>
          </div>

          <form onSubmit={handleGuardarActualizacion} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contenido de la actualización (Cifrado AES en reposo):
              </label>
              <textarea
                rows={4}
                required
                value={nuevoContenido}
                onChange={(e) => setNuevoContenido(e.target.value)}
                placeholder="Escribe lo que sientes, tus logros del día, tus dudas o situaciones que te inquieten..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:outline-none focus:border-[#7E22CE] leading-relaxed"
              />
            </div>

            {/* Toggle de Permiso para Compartir con el Psicólogo (RF-DIA-02) */}
            <div className="p-3 rounded-xl border border-slate-100 bg-white/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                {compartirSp ? (
                  <Eye className="w-4 h-4 text-[#39A900]" />
                ) : (
                  <EyeOff className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <p className="text-xs font-semibold text-slate-800">
                    Compartir mi diario con mi psicólogo asignado
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {compartirSp
                      ? 'Visible para tu psicólogo para enriquecer tus sesiones.'
                      : 'Privado absoluto: nadie más podrá leerlo.'}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={compartirSp}
                  onChange={(e) => setCompartirSp(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4.5 after:w-4.5 after:transition-all peer-checked:bg-[#7E22CE]"></div>
              </label>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                type="submit"
                disabled={guardando}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{guardando ? 'Guardando Actualización...' : 'Guardar Actualización'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* DIARIO ÚNICO DEL USUARIO */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            {isPsicologo ? 'Diario del aprendiz' : 'Tu Diario'}
          </h3>
          {diario && !isPsicologo && (
            <button
              onClick={handleToggleCompartir}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              title={diario.compartir_sp ? 'Hacer privado' : 'Compartir con psicólogo'}
            >
              <Share2 className="w-3.5 h-3.5" />
              {diario.compartir_sp ? 'Compartido' : 'Privado'}
            </button>
          )}
        </div>

        {cargando ? (
          <div className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Cargando diario...
          </div>
        ) : !diario ? (
          <div className="bg-transparent rounded-2xl p-8 text-center border border-transparent text-xs text-slate-400">
            {isPsicologo
              ? 'El aprendiz aún no ha creado su diario.'
              : 'Aún no has escrito nada en tu diario. ¡Agrega tu primera actualización!'}
          </div>
        ) : !diarioVisible ? (
          <div className="bg-transparent rounded-2xl p-8 text-center border border-transparent text-xs text-slate-400">
            Este diario es privado y no fue compartido contigo.
          </div>
        ) : (
          <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-slate-400 font-normal">
                  Apertura:{' '}
                  {new Date(diario.fecha_apertura).toLocaleDateString('es-CO', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
                {diario.compartir_sp ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF7E6] text-[#2E8500] flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    Compartido con Psicólogo
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 flex items-center gap-1">
                    <Lock className="w-3 h-3 text-slate-400" />
                    Privado
                  </span>
                )}
              </div>
            </div>

            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {diario.contenido || 'Sin contenido aún.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
