import React, { useState } from 'react';
import {
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  Bookmark,
  Sparkles,
  ShieldAlert,
  Calendar,
  Play,
  Pause,
  Smile,
  PhoneCall,
  Flame,
  Clock3,
  Award,
  TrendingUp,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Usuario, Publicacion, EstadoDeAnimo, Formulario } from '../types/serena.types';

interface HomeAprendizProps {
  currentUser: Usuario;
  publicaciones: Publicacion[];
  psicologoAsignado?: Usuario;
  ultimoEstadoAnimo?: EstadoDeAnimo;
  formulariosPendientes: Formulario[];
  onVote: (id_pub: number, delta: number) => void;
  onOpenEmergencia: () => void;
  onOpenEstadoAnimo: () => void;
  onOpenAgendarCita: () => void;
  onOpenFormularios: () => void;
  onSelectComunidad: (comunidadId: string) => void;
  idioma?: 'es' | 'en';
}

const AVATARES_CMTC = [
  { id: 'Feliz', nombre: 'Feliz', path: '/IMG/cmtc_feliz.svg', desc: 'Optimista y pleno' },
  { id: 'Calmado', nombre: 'Calmado', path: '/IMG/cmtc_calmado.svg', desc: 'Sereno y en paz' },
  { id: 'Ansioso', nombre: 'Ansioso', path: '/IMG/cmtc_ansioso.svg', desc: 'Tensión o estrés' },
  { id: 'Triste', nombre: 'Triste', path: '/IMG/cmtc_triste.svg', desc: 'Baja energía' },
  { id: 'Motivado', nombre: 'Motivado', path: '/IMG/cmtc_motivado.svg', desc: 'Foco activo' },
];

// Datos para la gráfica minimalista semanal de bienestar (Lunes a Domingo)
const REGISTROS_SEMANALES = [
  { dia: 'Lun', valor: 70, estado: 'Calmado' },
  { dia: 'Mar', valor: 85, estado: 'Motivado' },
  { dia: 'Mié', valor: 65, estado: 'Ansioso' },
  { dia: 'Jue', valor: 90, estado: 'Feliz' },
  { dia: 'Vie', valor: 80, estado: 'Calmado' },
  { dia: 'Sáb', valor: 95, estado: 'Feliz' },
  { dia: 'Dom', valor: 85, estado: 'Calmado', actual: true },
];

export const HomeAprendiz: React.FC<HomeAprendizProps> = ({
  currentUser,
  publicaciones = [],
  psicologoAsignado,
  ultimoEstadoAnimo,
  formulariosPendientes = [],
  onVote,
  onOpenEmergencia,
  onOpenEstadoAnimo,
  onOpenAgendarCita,
  onOpenFormularios,
  onSelectComunidad,
  idioma = 'es',
}) => {
  const [filtro, setFiltro] = useState<'populares' | 'recientes' | 'votos'>('populares');
  const [menuFiltroAbierto, setMenuFiltroAbierto] = useState(false);
  const [vistaCompacta, setVistaCompacta] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [savedPosts, setSavedPosts] = useState<number[]>([]);
  const [userVotes, setUserVotes] = useState<Record<number, number>>({});

  // Respiración Consciente
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'Inhala' | 'Retén' | 'Exhala' | 'Pausa'>('Inhala');
  const [breathingCount, setBreathingCount] = useState(4);

  // Efecto de temporizador para la respiración 4-4-4-4
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    if (breathingActive) {
      interval = setInterval(() => {
        setBreathingCount((prev) => {
          if (prev <= 1) {
            setBreathingPhase((currPhase) => {
              if (currPhase === 'Inhala') return 'Retén';
              if (currPhase === 'Retén') return 'Exhala';
              if (currPhase === 'Exhala') return 'Pausa';
              return 'Inhala';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [breathingActive]);

  const handleVoteClick = (id_pub: number, direction: number) => {
    const currentVote = userVotes[id_pub] || 0;
    let newVote = 0;
    if (currentVote === direction) {
      newVote = 0;
    } else {
      newVote = direction;
    }
    setUserVotes((prev) => ({ ...prev, [id_pub]: newVote }));
    onVote(id_pub, newVote - currentVote);
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

  // Ordenamiento según filtro seleccionado
  const listaOrdenada = [...publicaciones].sort((a, b) => {
    if (filtro === 'populares') return (b.votos || 0) + (b.comentarios || 0) - ((a.votos || 0) + (a.comentarios || 0));
    if (filtro === 'votos') return (b.votos || 0) - (a.votos || 0);
    return new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime();
  });

  const estadoActual = ultimoEstadoAnimo?.estado || 'Calmado';
  const avatarSeleccionadoInfo =
    AVATARES_CMTC.find((a) => a.id === estadoActual) || AVATARES_CMTC[1];

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto w-full">
      {/* Columna Principal: Feed de Publicaciones Plano con Hover */}
      <div className="lg:col-span-2 flex flex-col gap-3">
        {/* =========================================================================
            HEADER DE FEED MINIMALISTA IDÉNTICO A IMAGE.PNG
            - Lista disimulada con 'Populares' (Best) por defecto y chevron
            - Símbolo de layout/vista [⊟ ⌵] al lado
            - Línea divisoria sutil inferior
            ========================================================================= */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200/70 px-1 select-none relative">
          <div className="flex items-center gap-4">
            {/* Selector Disimulado de Orden (Populares / Recientes / Top) */}
            <div className="relative">
              <button
                onClick={() => setMenuFiltroAbierto(!menuFiltroAbierto)}
                className="flex items-center gap-1.5 text-sm font-medium text-slate-700 hover:text-slate-950 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100/70 cursor-pointer"
              >
                <span>
                  {filtro === 'populares'
                    ? (idioma === 'es' ? 'Populares' : 'Best')
                    : filtro === 'recientes'
                    ? (idioma === 'es' ? 'Más recientes' : 'New')
                    : (idioma === 'es' ? 'Top' : 'Top')}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-150 ${menuFiltroAbierto ? 'rotate-180' : ''}`} />
              </button>

              {/* Popover disimulado con las opciones */}
              {menuFiltroAbierto && (
                <>
                  <div
                    className="fixed inset-0 z-20"
                    onClick={() => setMenuFiltroAbierto(false)}
                  />
                  <div className="absolute left-0 top-full mt-1.5 z-30 w-40 bg-white border border-slate-200 rounded-xl shadow-xs py-1 text-xs animate-in fade-in zoom-in-95 duration-100">
                    <button
                      onClick={() => {
                        setFiltro('populares');
                        setMenuFiltroAbierto(false);
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between cursor-pointer ${
                        filtro === 'populares' ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{idioma === 'es' ? 'Populares' : 'Best'}</span>
                      {filtro === 'populares' && <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />}
                    </button>
                    <button
                      onClick={() => {
                        setFiltro('recientes');
                        setMenuFiltroAbierto(false);
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between cursor-pointer ${
                        filtro === 'recientes' ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{idioma === 'es' ? 'Más recientes' : 'New'}</span>
                      {filtro === 'recientes' && <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />}
                    </button>
                    <button
                      onClick={() => {
                        setFiltro('votos');
                        setMenuFiltroAbierto(false);
                      }}
                      className={`w-full text-left px-3 py-2 transition-colors flex items-center justify-between cursor-pointer ${
                        filtro === 'votos' ? 'font-semibold text-slate-900 bg-slate-50' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span>{idioma === 'es' ? 'Top votos' : 'Top'}</span>
                      {filtro === 'votos' && <span className="w-1.5 h-1.5 rounded-full bg-[#7E22CE]" />}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Selector Disimulado de Vista/Layout (Idéntico al de image.png: [⊟ ⌵]) */}
            <div className="relative">
              <button
                onClick={() => setVistaCompacta(!vistaCompacta)}
                title={vistaCompacta ? 'Cambiar a vista detallada' : 'Cambiar a vista compacta'}
                className="flex items-center gap-1 text-slate-600 hover:text-slate-900 transition-colors py-1 px-1.5 rounded-lg hover:bg-slate-100/70 cursor-pointer"
              >
                {/* Icono de tarjeta/compacto idéntico a image.png */}
                <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="w-4 h-4 text-slate-700">
                  <rect x="3" y="3.5" width="14" height="13" rx="2.5" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                </svg>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-normal">
            {listaOrdenada.length} publicaciones
          </span>
        </div>

        {/* =========================================================================
            LISTADO DE PUBLICACIONES:
            - Plano en estado de reposo (sin fondo ni bordes marcados)
            - Revela tarjeta suavemente solo al pasar el cursor (hover:bg-white hover:border-slate-200/80)
            ========================================================================= */}
        <div className="flex flex-col gap-2">
          {listaOrdenada.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              <p>
                {idioma === 'es'
                  ? 'No hay publicaciones en esta comunidad.'
                  : 'No posts available.'}
              </p>
            </div>
          ) : (
            listaOrdenada.map((pub) => {
              const userVote = userVotes[pub.id_publicaciones] || 0;
              const votosTotales = (pub.votos || 0) + userVote;
              const isSaved = savedPosts.includes(pub.id_publicaciones);

              return (
                <article
                  key={pub.id_publicaciones}
                  className="group relative bg-transparent rounded-2xl transition-all duration-150 p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs flex flex-col gap-2.5 cursor-pointer"
                >
                  {/* Cabecera del post */}
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => onSelectComunidad(pub.id_comunidad)}
                        className="w-5 h-5 rounded-full bg-[#39A900] flex items-center justify-center text-white text-[10px] font-bold cursor-pointer shrink-0"
                      >
                        s/
                      </button>

                      <button
                        onClick={() => onSelectComunidad(pub.id_comunidad)}
                        className="font-semibold text-slate-800 hover:underline cursor-pointer"
                      >
                        {pub.id_comunidad}
                      </button>

                      <span className="text-slate-300">•</span>

                      <span className="text-slate-400 font-normal">
                        {new Date(pub.fecha_publicacion).toLocaleDateString('es-CO', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>

                      <span className="text-slate-300">•</span>

                      <span className="text-slate-600 font-medium">
                        {pub.autor?.nombre_usuario || 'Dra. Laura Morales'}
                      </span>

                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87]">
                        SENA CMTC
                      </span>
                    </div>
                  </div>

                  {/* Título de la publicación */}
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 leading-snug group-hover:text-[#581C87] transition-colors">
                    {pub.titulo}
                  </h2>

                  {/* Contenido / Cuerpo */}
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                    {pub.contenido}
                  </p>

                  {/* Imagen adjunta si existe */}
                  {pub.url_imagen && (
                    <div className="rounded-xl overflow-hidden max-h-80 w-full bg-slate-100 mt-1">
                      <img
                        src={pub.url_imagen}
                        alt={pub.titulo}
                        className="w-full h-full object-cover group-hover:scale-[1.01] transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  {/* Acciones de la publicación: Píldoras grises sobrias */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* Votos */}
                    <div className="inline-flex items-center bg-slate-100 hover:bg-slate-200/80 rounded-full px-2 py-1 text-xs font-medium text-slate-700 transition-colors">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteClick(pub.id_publicaciones, 1);
                        }}
                        className={`p-1 hover:text-[#7E22CE] rounded-full transition-colors cursor-pointer ${
                          userVote === 1 ? 'text-[#7E22CE]' : 'text-slate-500'
                        }`}
                      >
                        <ArrowBigUp className={`w-4 h-4 ${userVote === 1 ? 'fill-current' : ''}`} />
                      </button>

                      <span className="px-1 font-semibold text-xs text-slate-800">
                        {votosTotales}
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleVoteClick(pub.id_publicaciones, -1);
                        }}
                        className={`p-1 hover:text-slate-900 rounded-full transition-colors cursor-pointer ${
                          userVote === -1 ? 'text-slate-900' : 'text-slate-500'
                        }`}
                      >
                        <ArrowBigDown className={`w-4 h-4 ${userVote === -1 ? 'fill-current' : ''}`} />
                      </button>
                    </div>

                    {/* Comentarios */}
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                      <span>{pub.comentarios || 18}</span>
                    </button>

                    {/* Compartir */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleShare(pub);
                      }}
                      className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-full px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors cursor-pointer"
                    >
                      <Share2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{copiedId === pub.id_publicaciones ? '¡Copiado!' : 'Compartir'}</span>
                    </button>

                    {/* Guardar */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSave(pub.id_publicaciones);
                      }}
                      title={isSaved ? 'Quitar de guardados' : 'Guardar publicación'}
                      className={`inline-flex items-center justify-center bg-slate-100 hover:bg-slate-200/80 rounded-full p-2 text-xs font-medium text-slate-700 transition-colors cursor-pointer ${
                        isSaved ? 'text-[#39A900]' : ''
                      }`}
                    >
                      <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#39A900]' : 'text-slate-500'}`} />
                    </button>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>

      {/* =========================================================================
          COLUMNA DERECHA:
          - En estado de reposo es completamente plana (sin borde ni fondo)
          - Al pasar el cursor, se nota la tarjeta suavemente
          - Gráficas cuantitativas minimalistas
          ========================================================================= */}
      <div className="flex flex-col gap-2">
        {/* Tarjeta 1: Bienestar al Aprendiz SENA */}
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#7E22CE]/10 text-[#7E22CE] flex items-center justify-center font-bold shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-sm text-slate-900">SERENA</h3>
                <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-[#7E22CE]/10 text-[#581C87]">
                  CMTC
                </span>
              </div>
              <p className="text-[10px] text-slate-500 leading-tight">
                Tu compañera Digital para el bienestar emocional
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Plataforma institucional de acompañamiento emocional y bienestar para aprendices del Centro de Manufactura en Textiles y Cuero.
          </p>

          {psicologoAsignado && (
            <div className="pt-2 border-t border-slate-200/50 flex flex-col gap-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Orientadora Asignada:
              </span>
              <p className="font-semibold text-xs text-slate-900">
                {psicologoAsignado.nombre_usuario}
              </p>
              <p className="text-[11px] text-slate-500">
                {psicologoAsignado.especialidad}
              </p>
              <button
                onClick={onOpenAgendarCita}
                className="mt-1 w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition-colors cursor-pointer text-center"
              >
                Agendar Cita de Orientación
              </button>
            </div>
          )}
        </div>

        {/* Tarjeta 2: GRÁFICA CUANTITATIVA MINIMALISTA DE ESTADO DE ÁNIMO */}
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-[#7E22CE]" />
                <span>Bienestar Emocional Semanal</span>
              </h4>
              <p className="text-[10px] text-slate-400">Indicador cuantitativo de estabilidad</p>
            </div>
            <span className="text-[11px] font-bold text-[#581C87] bg-[#7E22CE]/10 px-2 py-0.5 rounded-full">
              84% Estable
            </span>
          </div>

          {/* Gráfica de Barras Minimalista (Lunes a Domingo) */}
          <div className="pt-2 pb-1">
            <div className="flex items-end justify-between gap-1.5 h-20 px-1 border-b border-slate-200/60 pb-1">
              {REGISTROS_SEMANALES.map((item, idx) => {
                const isCurrent = item.actual;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group/bar relative">
                    {/* Tooltip con dato cuantitativo al hover */}
                    <div className="absolute -top-7 bg-slate-800 text-white text-[9px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                      {item.dia}: {item.valor}% ({item.estado})
                    </div>

                    {/* Barra minimalista */}
                    <div className="w-full max-w-[18px] bg-slate-100 rounded-t-md overflow-hidden flex flex-col justify-end h-full">
                      <div
                        style={{ height: `${item.valor}%` }}
                        className={`w-full rounded-t-md transition-all duration-500 ${
                          isCurrent
                            ? 'bg-[#7E22CE]'
                            : 'bg-slate-300 group-hover/bar:bg-[#581C87]'
                        }`}
                      />
                    </div>

                    {/* Etiqueta del día */}
                    <span className={`text-[10px] ${isCurrent ? 'font-bold text-[#581C87]' : 'text-slate-400'}`}>
                      {item.dia}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1.5 px-1">
              <span>Mín: 65% (Mié)</span>
              <span className="text-[#39A900] font-semibold">+6% vs sem. anterior</span>
              <span>Máx: 95% (Sáb)</span>
            </div>
          </div>

          {/* Resumen actual del estado de hoy */}
          <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-2">
              <Smile className="w-4 h-4 text-[#7E22CE]" />
              <span className="text-slate-700 font-medium">Hoy: {avatarSeleccionadoInfo.nombre}</span>
            </div>
            <button
              onClick={onOpenEstadoAnimo}
              className="text-[11px] text-[#7E22CE] hover:underline font-semibold cursor-pointer"
            >
              Registrar →
            </button>
          </div>
        </div>

        {/* Tarjeta 3: Agenda & Tamizajes Formativos */}
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h4 className="font-bold text-xs text-slate-900">
              {idioma === 'es' ? 'Agenda & Tamizajes' : 'Agenda & Screenings'}
            </h4>
            <span className="text-[10px] text-slate-500 font-normal">
              SENA CMTC
            </span>
          </div>

          {/* Barra de progreso cuantitativa minimalista */}
          <div className="flex flex-col gap-1 py-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-600 font-medium">Tamizajes Formativos</span>
              <span className="font-bold text-[#581C87]">2 / 3 completados (67%)</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#7E22CE] rounded-full w-[67%]" />
            </div>
          </div>

          <div className="flex flex-col gap-2 text-xs pt-1">
            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#7E22CE] mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  Taller: Manejo del estrés ante entregas
                </p>
                <p className="text-[10px] text-slate-400">Viernes 10:00 AM • Auditorio CMTC</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#39A900] mt-1.5 shrink-0" />
              <div>
                <p className="font-medium text-slate-800">
                  Pausas activas y salud postural
                </p>
                <p className="text-[10px] text-slate-400">Lunes a viernes 9:30 AM</p>
              </div>
            </div>
          </div>

          <button
            onClick={onOpenFormularios}
            className="text-[11px] font-medium text-[#7E22CE] hover:underline text-left pt-1 border-t border-slate-100 cursor-pointer"
          >
            Ver todos los formularios →
          </button>
        </div>

        {/* Tarjeta 4: Pausa Activa de Respiración Consciente */}
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900">
              Pausa de Respiración 4-4-4-4
            </span>
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              Anti-estrés
            </span>
          </div>

          <div className="flex items-center justify-center py-2">
            <div
              className={`w-18 h-18 rounded-full flex flex-col items-center justify-center text-center transition-all duration-1000 ${
                breathingActive
                  ? breathingPhase === 'Inhala'
                    ? 'bg-[#7E22CE]/10 ring-2 ring-[#7E22CE]/30 text-[#581C87]'
                    : breathingPhase === 'Exhala'
                    ? 'bg-slate-100 ring-2 ring-slate-300 text-slate-700'
                    : 'bg-[#39A900]/10 text-[#2E8500]'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              <span className="text-[9px] font-semibold uppercase">{breathingPhase}</span>
              <span className="text-sm font-bold">{breathingActive ? `${breathingCount}s` : '4s'}</span>
            </div>
          </div>

          <button
            onClick={() => setBreathingActive(!breathingActive)}
            className="w-full py-1.5 rounded-xl text-xs font-medium transition-colors flex items-center justify-center gap-1.5 cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-800"
          >
            {breathingActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{breathingActive ? 'Pausar' : 'Iniciar respiración 4x4'}</span>
          </button>
        </div>

        {/* Tarjeta 5: Atención y Soporte de Emergencia (24/7) - EL ÚNICO ELEMENTO QUE DESTACA */}
        <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-red-100 text-red-600">
                <ShieldAlert className="w-4 h-4" />
              </span>
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  {idioma === 'es' ? 'Atención en Crisis 24/7' : '24/7 Crisis Support'}
                </h4>
                <span className="text-[10px] text-slate-500">
                  Línea 106 • Confidencial SENA
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {idioma === 'es'
              ? 'Si estás pasando por una situación difícil o crisis emocional, cuentas con apoyo profesional inmediato.'
              : 'Free, confidential and immediate mental health crisis support.'}
          </p>

          {/* ESTE ES EL BOTÓN QUE DESTACA CLARAMENTE EN ROJO */}
          <button
            onClick={onOpenEmergencia}
            className="w-full py-2 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-white" />
            <span>{idioma === 'es' ? 'Llamar a Línea 106 / Emergencia' : 'Call 106 Emergency'}</span>
          </button>
        </div>

        {/* Footer minimalista */}
        <div className="px-2 py-1 text-[11px] text-slate-400 flex flex-wrap gap-x-2 gap-y-1">
          <span>Reglamento SENA</span>
          <span>•</span>
          <span>Privacidad</span>
          <span>•</span>
          <span>CMTC © 2026</span>
        </div>
      </div>
    </div>
  );
};
