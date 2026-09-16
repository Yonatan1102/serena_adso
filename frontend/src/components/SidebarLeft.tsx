import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Menu as MenuIcon,
  Info,
  HelpCircle,
  BookText,
  FileText,
  BarChart2,
  Smile,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Usuario, Comunidad, Menu, CustomFeed } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

/* ========================================================================
   ICONOS IDÉNTICOS A REDDIT (SEGÚN IMAGEN DE REFERENCIA ADJUNTA image.png)
   1. Home: Silueta sólida de casa con puerta
   2. Popular: Flecha diagonal hacia arriba a la derecha dentro de un círculo
   3. News: Periódico con doblado y líneas de texto
   4. Explore: 3 círculos (1 arriba, 2 abajo)
   5. Plus: Signo más fino y limpio (+ Start a community / + Cita)
   ======================================================================== */

export const RedditHomeIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 20 20" fill="currentColor" className={className}>
    <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h3a1 1 0 001-1v-3a1 1 0 011-1h0a1 1 0 011 1v3a1 1 0 001 1h3a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
  </svg>
);

export const RedditPopularIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="9.5" />
    <polyline points="10 8 16 8 16 14" />
    <line x1="8.5" y1="15.5" x2="16" y2="8" />
  </svg>
);

export const RedditNewsIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2" />
    <path d="M18 14h-8" />
    <path d="M15 18h-5" />
    <path d="M10 6h8v4h-8V6Z" />
  </svg>
);

export const RedditExploreIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="6" r="2.8" />
    <circle cx="6" cy="17" r="2.8" />
    <circle cx="18" cy="17" r="2.8" />
  </svg>
);

export const RedditPlusIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

interface SidebarLeftProps {
  currentUser: Usuario;
  activeView: string;
  setActiveView: (view: string) => void;
  comunidades: Comunidad[];
  selectedComunidadId: string;
  onSelectComunidad: (comunidadId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenCreatePublicacion: () => void;
  onOpenCreateSubComunidad: () => void;
  onOpenCreateFormulario: () => void;
  onOpenCreateCustomFeed: () => void;
  onOpenCreateReporte: () => void;
  onOpenRecursoModal: (tipo: 'about' | 'blog' | 'help') => void;
  idioma?: 'es' | 'en';
}

export const SidebarLeft: React.FC<SidebarLeftProps> = ({
  currentUser,
  activeView,
  setActiveView,
  comunidades = [],
  selectedComunidadId,
  onSelectComunidad,
  isCollapsed,
  onToggleCollapse,
  onOpenCreatePublicacion,
  onOpenCreateFormulario,
  onOpenCreateCustomFeed,
  onOpenCreateReporte,
  onOpenRecursoModal,
  idioma = 'es',
}) => {
  const isPsicologo = currentUser.id_rol === 2;

  const [customFeeds, setCustomFeeds] = useState<CustomFeed[]>(() =>
    serenaApi.getCustomFeeds()
  );

  const [comunidadesAbiertas, setComunidadesAbiertas] = useState(true);
  const [customFeedsAbiertos, setCustomFeedsAbiertos] = useState(true);

  useEffect(() => {
    setCustomFeeds(serenaApi.getCustomFeeds());
  }, [currentUser.id_rol]);

  /* ========================================================================
     ESTILOS SOBRIOS Y UNIFICADOS (COMO EN IMAGE.PNG)
     - Morado como color principal suave, Verde como color secundario
     - Sin fondos resaltados en botones "+ Cita", todo plano e integrado
     - Scrollbar gris clarito en el panel lateral
     ======================================================================== */
  const getItemClasses = (viewName: string) => {
    const isActive = activeView === viewName;
    return `w-full text-left px-3 py-2 rounded-xl text-sm font-normal flex items-center gap-3 transition-colors cursor-pointer ${
      isActive
        ? 'bg-[#7E22CE]/10 text-[#581C87] font-medium'
        : 'text-slate-800 hover:bg-slate-100'
    }`;
  };

  const getIconClasses = (viewName: string) => {
    const isActive = activeView === viewName;
    return `w-5 h-5 shrink-0 ${isActive ? 'text-[#7E22CE]' : 'text-slate-800'}`;
  };

  return (
    <motion.aside
      initial={false}
      animate={{
        width: isCollapsed ? 68 : 256,
      }}
      transition={{
        duration: 0.2,
        ease: [0.32, 0.72, 0, 1],
      }}
      className="h-full shrink-0 bg-transparent border-r border-slate-200/70 select-none text-xs relative z-30"
    >
      {/* Botón circular de colapsar en la línea divisoria: mitad adentro, mitad afuera (50% y 50%), completo sin cortes */}
      <button
        onClick={onToggleCollapse}
        title={isCollapsed ? (idioma === 'es' ? 'Expandir menú' : 'Expand sidebar') : (idioma === 'es' ? 'Comprimir menú' : 'Collapse sidebar')}
        className="absolute right-0 top-5 translate-x-1/2 z-40 w-6.5 h-6.5 bg-white border border-slate-200/90 rounded-full shadow-2xs hover:shadow-xs hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-all cursor-pointer select-none"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Contenedor scrolleable interno con barra súper delgada que solo aparece en hover */}
      <div className="w-full h-full py-3 flex flex-col justify-between overflow-y-auto overflow-x-hidden sidebar-light-scroll">
        {isCollapsed ? (
          /* MODO COLAPSADO: Solo iconos Reddit limpios */
          <div className="flex flex-col items-center gap-3 w-full h-full animate-in fade-in duration-150">
          <div className="flex flex-col items-center gap-1 w-full px-2">
            <button
              onClick={() => setActiveView('home')}
              title="Home"
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                activeView === 'home'
                  ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              <RedditHomeIcon className="w-5 h-5" />
            </button>

            {!isPsicologo ? (
              <>
                <button
                  onClick={() => setActiveView('diario')}
                  title="Diario"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'diario'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RedditNewsIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveView('estado_de_animo')}
                  title="Estado de Ánimo"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'estado_de_animo'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveView('formularios')}
                  title="Formularios"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'formularios'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveView('explorar')}
                  title="Explorar"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'explorar'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RedditExploreIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveView('citas')}
                  title="Agendar Cita"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RedditPlusIcon className="w-5 h-5" />
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setActiveView('explorar')}
                  title="Explorar"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'explorar'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <RedditExploreIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={onOpenCreatePublicacion}
                  title="Crear Publicación"
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <RedditPlusIcon className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveView('formularios')}
                  title="Formularios"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'formularios'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-5 h-5" />
                </button>

                <button
                  onClick={() => setActiveView('reportes')}
                  title="Reportes"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                    activeView === 'reportes'
                      ? 'bg-[#7E22CE]/10 text-[#7E22CE]'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <BarChart2 className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          <div className="w-6 h-px bg-slate-200" />

          {/* Información / Ayuda */}
          <button
            onClick={() => onOpenRecursoModal('about')}
            title="Acerca de SERENA"
            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer mt-auto"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
      ) : (
        /* MODO EXPANDIDO: EXACTO A LA IMAGEN DE REFERENCIA ADJUNTA image.png */
        <div className="flex flex-col justify-between h-full px-2 animate-in fade-in duration-150">
          <div className="flex flex-col gap-3">
            {!isPsicologo ? (
              /* =================================================================
                 APRENDIZ: Home, Diario (News), Explorar, "+ Cita" estilo image.png
                 ================================================================= */
              <>
                <div className="flex flex-col gap-0.5">
                  {/* 1. Home (idéntico al de image.png) */}
                  <button
                    onClick={() => setActiveView('home')}
                    className={getItemClasses('home')}
                  >
                    <RedditHomeIcon className={getIconClasses('home')} />
                    <span>Home</span>
                  </button>

                  {/* 2. Popular / Tendencias (como en image.png) */}
                  <button
                    onClick={() => setActiveView('home')}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-normal text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <RedditPopularIcon className="w-5 h-5 text-slate-800" />
                    <span>Popular</span>
                  </button>

                  {/* 3. Diario / News (como en image.png) */}
                  <button
                    onClick={() => setActiveView('diario')}
                    className={getItemClasses('diario')}
                  >
                    <RedditNewsIcon className={getIconClasses('diario')} />
                    <span>Diario & Noticias</span>
                  </button>

                  {/* 4. Estado de Ánimo */}
                  <button
                    onClick={() => setActiveView('estado_de_animo')}
                    className={getItemClasses('estado_de_animo')}
                  >
                    <Smile className={getIconClasses('estado_de_animo')} />
                    <span>Estado de Ánimo</span>
                  </button>

                  {/* 5. Formulario */}
                  <button
                    onClick={() => setActiveView('formularios')}
                    className={getItemClasses('formularios')}
                  >
                    <FileText className={getIconClasses('formularios')} />
                    <span>Formularios</span>
                  </button>

                  {/* 6. Explore (3 círculos, idéntico al de image.png) */}
                  <button
                    onClick={() => setActiveView('explorar')}
                    className={getItemClasses('explorar')}
                  >
                    <RedditExploreIcon className={getIconClasses('explorar')} />
                    <span>Explore</span>
                  </button>

                  {/* 7. Cita: EXACTAMENTE IGUAL a "+ Start a community" en image.png pero con icono + y texto limpio */}
                  <button
                    onClick={() => setActiveView('citas')}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-normal text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <RedditPlusIcon className="w-5 h-5 text-slate-800" />
                    <span>Cita (Orientación)</span>
                  </button>
                </div>

                <div className="h-px bg-slate-200/60 mx-2" />

                {/* CUSTOM FEEDS */}
                <div className="flex flex-col">
                  <div
                    onClick={() => setCustomFeedsAbiertos(!customFeedsAbiertos)}
                    className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  >
                    <span>CUSTOM FEEDS</span>
                    {customFeedsAbiertos ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {customFeedsAbiertos && (
                    <div className="flex flex-col gap-0.5 mt-0.5 no-scrollbar">
                      {(customFeeds || []).map((feed) => (
                        <button
                          key={feed.id}
                          onClick={() => {
                            setActiveView('home');
                            if (feed.comunidades && feed.comunidades[0]) {
                              onSelectComunidad(feed.comunidades[0]);
                            }
                          }}
                          className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2.5 cursor-pointer"
                        >
                          <RedditExploreIcon className="w-4 h-4 text-slate-500" />
                          <span className="truncate">{feed.nombre}</span>
                        </button>
                      ))}

                      {/* Create Custom (plano sin resaltar, estilo image.png) */}
                      <button
                        onClick={onOpenCreateCustomFeed}
                        className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer mt-0.5"
                      >
                        <RedditPlusIcon className="w-4 h-4 text-slate-600" />
                        <span>Create Custom</span>
                      </button>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-200/60 mx-2" />

                {/* COMMUNITY */}
                <div className="flex flex-col">
                  <div
                    onClick={() => setComunidadesAbiertas(!comunidadesAbiertas)}
                    className="flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider cursor-pointer hover:text-slate-700"
                  >
                    <span>COMMUNITIES</span>
                    {comunidadesAbiertas ? (
                      <ChevronDown className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronRight className="w-3.5 h-3.5" />
                    )}
                  </div>

                  {comunidadesAbiertas && (
                    <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto mt-0.5 no-scrollbar">
                      {(comunidades || []).map((c) => {
                        const isSelected = selectedComunidadId === c.id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => {
                              onSelectComunidad(c.id);
                              setActiveView('home');
                            }}
                            className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected && activeView === 'home'
                                ? 'bg-slate-200/70 text-slate-900 font-medium'
                                : 'text-slate-700 hover:bg-slate-100 font-normal'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="w-4 h-4 rounded-full bg-[#39A900] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                                s/
                              </span>
                              <span className="truncate">{c.id}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-200/60 mx-2" />

                {/* RECURSOS */}
                <div className="flex flex-col gap-0.5">
                  <span className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    RECURSOS
                  </span>
                  <button
                    onClick={() => onOpenRecursoModal('about')}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-slate-500" />
                    <span>About Serena</span>
                  </button>
                  <button
                    onClick={() => onOpenRecursoModal('help')}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <HelpCircle className="w-4 h-4 text-slate-500" />
                    <span>Help</span>
                  </button>
                  <button
                    onClick={() => onOpenRecursoModal('blog')}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-700 hover:bg-slate-100 flex items-center gap-2.5 transition-colors cursor-pointer"
                  >
                    <BookText className="w-4 h-4 text-slate-500" />
                    <span>Blog</span>
                  </button>
                </div>
              </>
            ) : (
              /* =================================================================
                 PSICÓLOGO: Estilo plano y unificado con símbolos idénticos
                 ================================================================= */
              <>
                <div className="flex flex-col gap-0.5">
                  <span className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    PANEL PROFESIONAL
                  </span>
                  <button
                    onClick={() => setActiveView('home')}
                    className={getItemClasses('home')}
                  >
                    <RedditHomeIcon className={getIconClasses('home')} />
                    <span>Home (Agenda)</span>
                  </button>

                  <button
                    onClick={() => setActiveView('explorar')}
                    className={getItemClasses('explorar')}
                  >
                    <RedditExploreIcon className={getIconClasses('explorar')} />
                    <span>Explore</span>
                  </button>

                  {/* Crear Publicación: Plano, estilo "+ start a community" */}
                  <button
                    onClick={onOpenCreatePublicacion}
                    className="w-full text-left px-3 py-2 rounded-xl text-sm font-normal text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <RedditPlusIcon className="w-5 h-5 text-slate-800" />
                    <span>Crear Publicación</span>
                  </button>
                </div>

                <div className="h-px bg-slate-200/60 mx-2" />

                {/* FORMULARIOS */}
                <div className="flex flex-col gap-0.5">
                  <span className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    FORMULARIOS
                  </span>
                  <button
                    onClick={() => setActiveView('formularios')}
                    className={getItemClasses('formularios')}
                  >
                    <FileText className={getIconClasses('formularios')} />
                    <span>Ver Formularios</span>
                  </button>

                  {/* Subir Formulario (plano) */}
                  <button
                    onClick={onOpenCreateFormulario}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <RedditPlusIcon className="w-4 h-4 text-slate-800" />
                    <span>Subir Formulario</span>
                  </button>
                </div>

                <div className="h-px bg-slate-200/60 mx-2" />

                {/* REPORTES */}
                <div className="flex flex-col gap-0.5">
                  <span className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    REPORTES
                  </span>
                  <button
                    onClick={() => setActiveView('reportes')}
                    className={getItemClasses('reportes')}
                  >
                    <BarChart2 className={getIconClasses('reportes')} />
                    <span>Reportes Clínicos</span>
                  </button>

                  {/* Crear Reportes (plano) */}
                  <button
                    onClick={onOpenCreateReporte}
                    className="w-full text-left px-3 py-1.5 rounded-xl text-sm font-normal text-slate-800 hover:bg-slate-100 transition-colors flex items-center gap-3 cursor-pointer"
                  >
                    <RedditPlusIcon className="w-4 h-4 text-slate-800" />
                    <span>Crear Reportes</span>
                  </button>
                </div>

                <div className="h-px bg-slate-200/60 mx-2" />

                {/* COMUNIDADES */}
                <div className="flex flex-col gap-0.5">
                  <span className="px-3 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    COMUNIDADES
                  </span>
                  <div className="flex flex-col gap-0.5 max-h-36 overflow-y-auto no-scrollbar">
                    {(comunidades || []).map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onSelectComunidad(c.id);
                          setActiveView('home');
                        }}
                        className={`w-full text-left px-3 py-1.5 rounded-xl text-sm transition-colors cursor-pointer flex items-center gap-2 ${
                          selectedComunidadId === c.id ? 'font-medium text-slate-900 bg-slate-200/70' : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span className="w-4 h-4 rounded-full bg-[#39A900] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          s/
                        </span>
                        <span className="truncate">{c.id}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer institucional minimalista */}
          <div className="pt-3 border-t border-slate-200/70 px-3 text-[11px] text-slate-400 flex flex-col gap-0.5">
            <p className="font-semibold text-slate-500">SERENA © 2026</p>
            <p className="text-[10px] text-slate-400">SENA CMTC • Bienestar al Aprendiz</p>
          </div>
        </div>
      )}
      </div>
    </motion.aside>
  );
};
