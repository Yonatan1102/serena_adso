import React, { useState } from 'react';
import {
  BookMarked,
  Lock,
  Unlock,
  Share2,
  ShieldCheck,
  PlusCircle,
  FileCheck2,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
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
    ? aprendizSeleccionado?.id_usuario || 1
    : currentUser.id_usuario;

  const [entradas, setEntradas] = useState<Diario[]>(() =>
    serenaApi.getDiario(idObjetivo, currentUser.id_rol, currentUser.id_usuario)
  );

  const [nuevoTitulo, setNuevoTitulo] = useState('');
  const [nuevoContenido, setNuevoContenido] = useState('');
  const [compartirSp, setCompartirSp] = useState<boolean>(false);
  const [guardando, setGuardando] = useState(false);

  const handleGuardarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoContenido.trim()) return;

    setGuardando(true);
    serenaApi.guardarEntradaDiario(
      currentUser.id_usuario,
      nuevoTitulo || 'Reflexión diaria',
      nuevoContenido,
      compartirSp ? 1 : 0
    );

    setTimeout(() => {
      setGuardando(false);
      setNuevoTitulo('');
      setNuevoContenido('');
      setCompartirSp(false);
      setEntradas(
        serenaApi.getDiario(idObjetivo, currentUser.id_rol, currentUser.id_usuario)
      );
      alert('Entrada de diario guardada y cifrada en reposo con éxito.');
    }, 350);
  };

  const handleToggleCompartir = (entrada: Diario) => {
    const nuevoValor = entrada.compartir_sp === 1 ? 0 : 1;
    serenaApi.cambiarPermisoCompartirDiario(entrada.id_diario, nuevoValor);
    setEntradas(
      serenaApi.getDiario(idObjetivo, currentUser.id_rol, currentUser.id_usuario)
    );
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
              ? `Diario Compartido: ${aprendizSeleccionado?.nombre_usuario || 'Aprendiz'}`
              : 'Mi Diario Personal de Bienestar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isPsicologo
              ? 'Visualizando únicamente las reflexiones que el aprendiz autorizó compartir de forma explícita (compartir_sp = 1).'
              : 'Espacio seguro de desahogo y autorreflexión. Tus textos están protegidos mediante cifrado AES-256 en reposo.'}
          </p>
        </div>

        {onVolver && (
          <button
            onClick={onVolver}
            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs rounded-xl cursor-pointer transition-colors"
          >
            ← Volver a Citas
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
                ? 'Las entradas con compartir_sp = 0 no son accesibles para ningún profesional por mandato del código ético.'
                : 'Tú decides qué entradas son privadas y cuáles deseas que lea tu psicólogo asignado.'}
            </p>
          </div>
        </div>
      </div>

      {/* FORMULARIO DE NUEVA ENTRADA (Solo para Aprendices) */}
      {!isPsicologo && (
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-[#7E22CE]" />
              <span>Escribir Nueva Entrada</span>
            </h3>
            <p className="text-xs text-slate-400">
              Escribe libremente. Nadie podrá leerlo a menos que actives la casilla de compartir con tu psicólogo.
            </p>
          </div>

          <form onSubmit={handleGuardarEntrada} className="flex flex-col gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Título de la reflexión:
              </label>
              <input
                type="text"
                value={nuevoTitulo}
                onChange={(e) => setNuevoTitulo(e.target.value)}
                placeholder="Ej: Pensamientos sobre mi progreso en el taller textil..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:outline-none focus:border-[#7E22CE] font-normal"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contenido (Cifrado AES en reposo):
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
                    Compartir con mi psicólogo asignado (compartir_sp)
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
                <span>{guardando ? 'Cifrando y Guardando...' : 'Guardar en mi Diario'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* LISTADO DE ENTRADAS REGISTRADAS */}
      <div className="flex flex-col gap-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 px-1">
          {isPsicologo ? 'Entradas autorizadas por el aprendiz:' : 'Tus Entradas Guardadas:'}
        </h3>

        {entradas.length === 0 ? (
          <div className="bg-transparent rounded-2xl p-8 text-center border border-transparent text-xs text-slate-400">
            {isPsicologo
              ? 'El aprendiz no tiene entradas de diario compartidas en este momento.'
              : 'Aún no has escrito entradas en tu diario. ¡Comienza hoy!'}
          </div>
        ) : (
          entradas.map((entrada) => (
            <div
              key={entrada.id_diario}
              className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900">{entrada.titulo}</h4>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {new Date(entrada.fecha_apertura).toLocaleDateString('es-CO', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {entrada.compartir_sp === 1 ? (
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

                  {!isPsicologo && (
                    <button
                      onClick={() => handleToggleCompartir(entrada)}
                      className="p-1 hover:bg-slate-100 text-slate-500 rounded-lg text-xs cursor-pointer transition-colors"
                      title={entrada.compartir_sp === 1 ? 'Hacer privado' : 'Compartir con psicólogo'}
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {entrada.contenido}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
