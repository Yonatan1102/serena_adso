import React, { useState } from 'react';
import {
  CalendarCheck,
  Users,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Plus,
  Send,
  Sparkles,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  MoreHorizontal,
  BarChart2,
} from 'lucide-react';
import { Cita, Usuario, Publicacion } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface HomePsicologoProps {
  currentUser: Usuario;
  citas: Cita[];
  aprendicesSeguimiento: Usuario[];
  publicaciones: Publicacion[];
  onOpenCreatePublicacion: () => void;
  onSelectAprendizHistoria: (aprendiz: Usuario) => void;
  onRefreshCitas: () => void;
  idioma?: 'es' | 'en';
}

export const HomePsicologo: React.FC<HomePsicologoProps> = ({
  currentUser,
  citas = [],
  aprendicesSeguimiento = [],
  publicaciones = [],
  onOpenCreatePublicacion,
  onSelectAprendizHistoria,
  onRefreshCitas,
  idioma = 'es',
}) => {
  const [tabEstadoCita, setTabEstadoCita] = useState<string>('Todas');
  const [modalSolicitarCita, setModalSolicitarCita] = useState(false);
  const [aprendizSeleccionadoId, setAprendizSeleccionadoId] = useState<number>(
    aprendicesSeguimiento[0]?.id_usuario || 0
  );
  const [motivoSolicitud, setMotivoSolicitud] = useState('');
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Filtrado de citas
  const citasFiltradas = citas.filter((c) => {
    if (tabEstadoCita === 'Todas') return true;
    return c.estado_cita === tabEstadoCita;
  });

  // Aprendices con alertas emocionales
  const aprendicesEnRiesgo = aprendicesSeguimiento.filter(
    (a) => a.ultimo_estado_animo === 'Ansioso' || a.ultimo_estado_animo === 'Triste'
  );

  // Publicaciones del psicólogo
  const misPublicaciones = publicaciones.filter(
    (p) => p.autor?.id_usuario === currentUser.id_usuario || p.id_usuario === currentUser.id_usuario
  );

  // Cálculo cuantitativo para gráficas minimalistas
  const countConfirmadas = citas.filter((c) => c.estado_cita === 'Confirmada').length;
  const countPendientes = citas.filter((c) => c.estado_cita === 'Pendiente').length;
  const countRealizadas = citas.filter((c) => c.estado_cita === 'Realizada').length;
  const countCanceladas = citas.filter((c) => c.estado_cita === 'Cancelada').length;
  const totalCitas = citas.length || 1;

  const handleCambiarEstado = (idCita: number, nuevoEstado: 'Confirmada' | 'Cancelada' | 'Realizada') => {
    serenaApi.actualizarEstadoCita(idCita, nuevoEstado, 'Actualización de estado desde panel clínico del psicólogo.');
    onRefreshCitas();
  };

  const handleEnviarSolicitud = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aprendizSeleccionadoId || !motivoSolicitud) return;

    serenaApi.solicitarCitaSinAgendar(currentUser.id_usuario, aprendizSeleccionadoId, motivoSolicitud);
    setModalSolicitarCita(false);
    setMotivoSolicitud('');
    onRefreshCitas();
  };

  const handleVoteClick = (id_pub: number, direction: number) => {
    const currentVote = userVotes[id_pub] || 0;
    let newVote = 0;
    if (currentVote === direction) {
      newVote = 0;
    } else {
      newVote = direction;
    }
    setUserVotes((prev) => ({ ...prev, [id_pub]: newVote }));
  };

  const toggleSave = (id_pub: number) => {
    setSavedPosts((prev) =>
      prev.includes(id_pub) ? prev.filter((id) => id !== id_pub) : [...prev, id_pub]
    );
  };

  const handleShare = (pub: Publicacion) => {
    navigator.clipboard?.writeText?.(window.location.href);
    setCopiedId(pub.id_publicaciones);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const totalUpvotes = misPublicaciones.reduce((acc, p) => acc + (p.votos || 0), 0);
  const totalComentarios = misPublicaciones.reduce((acc, p) => acc + (p.comentarios || 0), 0);

  return (
    <div className="flex-1 flex flex-col gap-6 max-w-6xl mx-auto w-full">
      {/* =========================================================================
          BLOQUE SUPERIOR:
          - Izquierda (2 cols): Citas Programadas con Gráfica Minimalista de Estados
          - Derecha (1 col): Aprendices Asignados y Alertas
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* CENTRO: Tarjeta plana de Citas Programadas con Gráfica Minimalista */}
        <div className="lg:col-span-2 bg-transparent rounded-2xl border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 p-4 sm:p-5 flex flex-col gap-3">
          {/* Header limpio */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#7E22CE]/10 text-[#7E22CE] flex items-center justify-center font-bold">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">
                  {idioma === 'es' ? 'Agenda Clínica & Citas' : 'Scheduled Appointments'}
                </h2>
                <p className="text-xs text-slate-500">
                  {idioma === 'es'
                    ? 'Orientación psicológica y seguimiento individual'
                    : 'Clinical sessions and follow-up'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setModalSolicitarCita(true)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3 h-3 text-slate-600" />
              <span>{idioma === 'es' ? 'Solicitar Cita' : 'Request Appt'}</span>
            </button>
          </div>

          {/* GRÁFICA CUANTITATIVA MINIMALISTA: Distribución de Citas */}
          <div className="p-3 rounded-xl bg-slate-50/60 border border-slate-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <BarChart2 className="w-3.5 h-3.5 text-[#7E22CE]" />
                Distribución Cuantitativa de Citas
              </span>
              <span className="text-[11px] text-slate-400">Total: {citas.length} registradas</span>
            </div>

            {/* Barra horizontal minimalista de segmentos proporcionales */}
            <div className="w-full h-2 rounded-full bg-slate-200 flex overflow-hidden">
              <div
                style={{ width: `${(countConfirmadas / totalCitas) * 100}%` }}
                title={`Confirmadas: ${countConfirmadas}`}
                className="bg-[#39A900] h-full"
              />
              <div
                style={{ width: `${(countPendientes / totalCitas) * 100}%` }}
                title={`Pendientes: ${countPendientes}`}
                className="bg-amber-400 h-full"
              />
              <div
                style={{ width: `${(countRealizadas / totalCitas) * 100}%` }}
                title={`Realizadas: ${countRealizadas}`}
                className="bg-[#7E22CE] h-full"
              />
              <div
                style={{ width: `${(countCanceladas / totalCitas) * 100}%` }}
                title={`Canceladas: ${countCanceladas}`}
                className="bg-slate-300 h-full"
              />
            </div>

            {/* Leyenda cuantitativa minimalista */}
            <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 flex-wrap gap-2">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#39A900]" />
                Confirmadas: <strong>{countConfirmadas}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Pendientes: <strong>{countPendientes}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#7E22CE]" />
                Realizadas: <strong>{countRealizadas}</strong>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-300" />
                Canceladas: <strong>{countCanceladas}</strong>
              </span>
            </div>
          </div>

          {/* Filtros minimalistas de estados de cita */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            {['Todas', 'Pendiente', 'Confirmada', 'Realizada', 'Cancelada'].map((estado) => {
              const isActive = tabEstadoCita === estado;
              return (
                <button
                  key={estado}
                  onClick={() => setTabEstadoCita(estado)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-slate-200 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {estado}
                </button>
              );
            })}
          </div>

          {/* Lista de Citas */}
          <div className="flex flex-col gap-2 max-h-[360px] overflow-y-auto discreet-scroll pr-1">
            {citasFiltradas.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                {idioma === 'es'
                  ? 'No hay citas registradas con este filtro.'
                  : 'No appointments found.'}
              </div>
            ) : (
              citasFiltradas.map((cita) => {
                const fecha = new Date(cita.fecha_hora);
                const fechaFormateada = fecha.toLocaleDateString('es-CO', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                const badgeColor =
                  cita.estado_cita === 'Confirmada'
                    ? 'text-[#2E8500] bg-[#39A900]/10'
                    : cita.estado_cita === 'Pendiente'
                    ? 'text-amber-800 bg-amber-50'
                    : cita.estado_cita === 'Realizada'
                    ? 'text-[#581C87] bg-[#7E22CE]/10'
                    : 'text-slate-600 bg-slate-100';

                return (
                  <div
                    key={cita.id_cita}
                    className="p-3 rounded-xl border border-slate-200/60 bg-white hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {cita.aprendiz?.nombre_usuario.charAt(0) || 'A'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-xs text-slate-900">
                            {cita.aprendiz?.nombre_usuario || 'Aprendiz'}
                          </span>
                          <span className="text-[11px] text-slate-400 font-normal">
                            Ficha {cita.aprendiz?.num_ficha || '3288046'}
                          </span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                            {cita.estado_cita}
                          </span>
                        </div>

                        <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">
                          <span className="text-slate-400">Motivo: </span>
                          {cita.motivo}
                        </p>

                        <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5 font-normal">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{fechaFormateada}</span>
                        </p>
                      </div>
                    </div>

                    {/* Acciones de psicólogo sobre la cita */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {cita.estado_cita === 'Pendiente' && (
                        <button
                          onClick={() => handleCambiarEstado(cita.id_cita, 'Confirmada')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#2E8500] hover:bg-[#39A900]/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Confirmar</span>
                        </button>
                      )}

                      {cita.estado_cita === 'Confirmada' && (
                        <button
                          onClick={() => handleCambiarEstado(cita.id_cita, 'Realizada')}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#581C87] hover:bg-[#7E22CE]/10 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completar</span>
                        </button>
                      )}

                      {cita.estado_cita !== 'Cancelada' && cita.estado_cita !== 'Realizada' && (
                        <button
                          onClick={() => handleCambiarEstado(cita.id_cita, 'Cancelada')}
                          className="px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: Aprendices Asignados y Alertas */}
        <div className="flex flex-col gap-3">
          {/* Tarjeta 1: Aprendices Asignados */}
          <div className="bg-transparent rounded-2xl border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 p-4 sm:p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#7E22CE]" />
                <h3 className="font-bold text-xs text-slate-900">
                  {idioma === 'es' ? 'Aprendices en Seguimiento' : 'Assigned Apprentices'}
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {aprendicesSeguimiento.length}
              </span>
            </div>

            <div className="flex flex-col gap-1.5 max-h-[220px] overflow-y-auto discreet-scroll pr-1">
              {aprendicesSeguimiento.map((aprendiz) => (
                <div
                  key={aprendiz.id_usuario}
                  onClick={() => onSelectAprendizHistoria(aprendiz)}
                  className="p-2 rounded-xl border border-slate-100 hover:border-slate-200 bg-white/70 hover:bg-white flex items-center justify-between gap-2 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-[11px] shrink-0">
                      {aprendiz.nombre_usuario.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-xs text-slate-800 leading-tight">
                        {aprendiz.nombre_usuario}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Ficha {aprendiz.num_ficha}
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-medium text-[#7E22CE] hover:underline">
                    Ver ficha →
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tarjeta 2: Aprendices en Riesgo */}
          <div className="bg-transparent rounded-2xl border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 p-4 sm:p-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-bold text-xs text-slate-900">
                  {idioma === 'es' ? 'Atención Prioritaria' : 'At-Risk Apprentices'}
                </h3>
              </div>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                {aprendicesEnRiesgo.length} casos
              </span>
            </div>

            <div className="flex flex-col gap-2">
              {aprendicesEnRiesgo.length === 0 ? (
                <p className="text-xs text-slate-400 py-1">
                  Sin indicadores críticos en este momento.
                </p>
              ) : (
                aprendicesEnRiesgo.map((a) => (
                  <div
                    key={a.id_usuario}
                    className="p-2.5 rounded-xl border border-slate-200/60 bg-white flex flex-col gap-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900">
                        {a.nombre_usuario}
                      </span>
                      <span className="text-[10px] text-amber-600 font-semibold">
                        Ficha {a.num_ficha}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">
                      Estrés situacional detectado en registro de bienestar.
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                      <button
                        onClick={() => onSelectAprendizHistoria(a)}
                        className="text-[11px] text-[#7E22CE] font-semibold hover:underline cursor-pointer"
                      >
                        Expediente
                      </button>
                      <button
                        onClick={() => {
                          setAprendizSeleccionadoId(a.id_usuario);
                          setModalSolicitarCita(true);
                        }}
                        className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-medium text-[10px] hover:bg-slate-200 cursor-pointer"
                      >
                        Priorizar Cita
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE INFERIOR:
          - Feed de sus propias publicaciones
          - Tarjeta al costado con estadísticas cuantitativas
          ========================================================================= */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-3 border-b border-slate-200/60 pb-2 px-1">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              {idioma === 'es' ? 'Tus Publicaciones en la Comunidad' : 'Your Community Posts'}
            </h2>
            <p className="text-xs text-slate-500">
              {idioma === 'es'
                ? 'Artículos, pautas y cápsulas de bienestar emitidas por tu consultorio'
                : 'Articles and wellness tips published by you'}
            </p>
          </div>

          <button
            onClick={onOpenCreatePublicacion}
            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 font-medium text-xs text-slate-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span>{idioma === 'es' ? 'Nueva Publicación' : 'New Post'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Columna Izquierda (2 cols): Publicaciones planas */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {misPublicaciones.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Aún no has creado publicaciones. ¡Comparte pautas y talleres con los aprendices!
              </div>
            ) : (
              misPublicaciones.map((pub) => {
                const userVote = userVotes[pub.id_publicaciones] || 0;
                const votosTotales = (pub.votos || 0) + userVote;
                const isSaved = savedPosts.includes(pub.id_publicaciones);

                return (
                  <article
                    key={pub.id_publicaciones}
                    className="bg-transparent rounded-2xl border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 p-4 sm:p-5 flex flex-col gap-2.5"
                  >
                    {/* Cabecera */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-full">
                          {pub.id_comunidad}
                        </span>
                        <span>•</span>
                        <span>Publicado por ti</span>
                        <span>•</span>
                        <span className="text-slate-400">
                          {new Date(pub.fecha_publicacion).toLocaleDateString()}
                        </span>
                      </div>

                      <button
                        onClick={() => handleShare(pub)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Título */}
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {pub.titulo}
                    </h3>

                    {/* Contenido */}
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                      {pub.contenido}
                    </p>

                    {/* Espacio de Imagen */}
                    {pub.imagen_url && (
                      <div className="rounded-xl overflow-hidden bg-slate-100 max-h-80 flex items-center justify-center my-1">
                        <img
                          src={pub.imagen_url}
                          alt={pub.titulo}
                          className="w-full max-h-80 object-cover"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {/* Píldoras de interacción */}
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <div className="inline-flex items-center bg-slate-100 hover:bg-slate-200/80 rounded-full px-2 py-1 text-xs font-medium text-slate-800 transition-colors">
                        <button
                          onClick={() => handleVoteClick(pub.id_publicaciones, 1)}
                          className={`p-1 rounded-full hover:text-[#7E22CE] cursor-pointer transition-colors ${
                            userVote === 1 ? 'text-[#7E22CE]' : 'text-slate-500'
                          }`}
                          title="Voto positivo"
                        >
                          <ArrowBigUp className="w-4 h-4 fill-current" />
                        </button>
                        <span className="px-1 text-xs font-semibold">{votosTotales}</span>
                        <button
                          onClick={() => handleVoteClick(pub.id_publicaciones, -1)}
                          className={`p-1 rounded-full hover:text-slate-900 cursor-pointer transition-colors ${
                            userVote === -1 ? 'text-slate-900' : 'text-slate-500'
                          }`}
                          title="Voto negativo"
                        >
                          <ArrowBigDown className="w-4 h-4 fill-current" />
                        </button>
                      </div>

                      <button className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer">
                        <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                        <span>{pub.comentarios || pub.comentarios_count || 0}</span>
                      </button>

                      <button
                        onClick={() => handleShare(pub)}
                        className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>
                          {copiedId === pub.id_publicaciones ? '¡Copiado!' : 'Compartir'}
                        </span>
                      </button>

                      <button
                        onClick={() => toggleSave(pub.id_publicaciones)}
                        className={`inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 rounded-full p-2 text-xs font-medium text-slate-700 transition-colors cursor-pointer ${
                          isSaved ? 'text-[#39A900]' : ''
                        }`}
                      >
                        <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#39A900]' : ''}`} />
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          {/* Columna Derecha (1 col): Estadísticas Cuantitativas Minimalistas */}
          <div className="flex flex-col gap-3">
            <div className="bg-transparent rounded-2xl border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 p-4 sm:p-5 flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#7E22CE]" />
                <h3 className="font-bold text-xs text-slate-900">
                  {idioma === 'es' ? 'Rendimiento de tus Posts' : 'Post Performance'}
                </h3>
              </div>

              {/* Estadísticas cuantitativas en grid sobrio */}
              <div className="grid grid-cols-3 gap-2 text-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div>
                  <p className="text-base font-bold text-slate-900">{misPublicaciones.length}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Posts</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#7E22CE]">{totalUpvotes}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Votos</p>
                </div>
                <div>
                  <p className="text-base font-bold text-[#2E8500]">{totalComentarios}</p>
                  <p className="text-[10px] text-slate-400 font-medium uppercase">Respuestas</p>
                </div>
              </div>

              {/* Detalle por publicación */}
              <div className="flex flex-col gap-2 pt-1">
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Detalle por publicación:
                </p>
                {misPublicaciones.map((p) => (
                  <div
                    key={p.id_publicaciones}
                    className="p-2 rounded-xl border border-slate-100 bg-white flex flex-col gap-1"
                  >
                    <p className="font-semibold text-xs text-slate-800 line-clamp-1">
                      {p.titulo}
                    </p>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="text-[#7E22CE] font-medium">
                        ▲ {p.votos || 0} votos
                      </span>
                      <span>💬 {p.comentarios || p.comentarios_count || 0}</span>
                      <span className="text-[#2E8500] font-medium">96% positivo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Solicitar Cita Sin Agendar */}
      {modalSolicitarCita && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
              <h3 className="font-bold text-sm text-slate-900">
                Solicitar Cita a Aprendiz
              </h3>
              <button
                onClick={() => setModalSolicitarCita(false)}
                className="w-7 h-7 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEnviarSolicitud} className="p-5 flex flex-col gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Seleccionar Aprendiz Asignado:
                </label>
                <select
                  value={aprendizSeleccionadoId}
                  onChange={(e) => setAprendizSeleccionadoId(Number(e.target.value))}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-[#7E22CE] focus:outline-none bg-white"
                >
                  {(aprendicesSeguimiento || []).map((a) => (
                    <option key={a.id_usuario} value={a.id_usuario}>
                      {a.nombre_usuario} (Ficha {a.num_ficha})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Motivo institucional:
                </label>
                <textarea
                  required
                  rows={3}
                  value={motivoSolicitud}
                  onChange={(e) => setMotivoSolicitud(e.target.value)}
                  placeholder="Ej: Seguimiento periódico acordado en la última sesión..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-[#7E22CE] focus:outline-none resize-none bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalSolicitarCita(false)}
                  className="px-3.5 py-1.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl font-medium text-white bg-[#7E22CE] hover:bg-[#6B21A8] transition-colors"
                >
                  Enviar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
