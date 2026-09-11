import React, { useState } from 'react';
import {
  Bell,
  Globe,
  Settings,
  Plus,
  User as UserIcon,
  Menu as MenuIcon,
  CheckCircle2,
  ExternalLink,
  ShieldAlert,
  Heart,
  ChevronDown,
} from 'lucide-react';
import { Usuario } from '../types/serena.types';

interface HeaderProps {
  currentUser: Usuario;
  usuariosDisponibles: Usuario[];
  onSelectUser: (user: Usuario) => void;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onOpenCrearDiarioRapido: () => void;
  onOpenCreatePublicacion: () => void;
  onOpenBackendGuide: () => void;
  onOpenEmergencia?: () => void;
  idioma: 'es' | 'en';
  onToggleIdioma: () => void;
  onSearchChange?: (term: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  usuariosDisponibles,
  onSelectUser,
  onToggleSidebar,
  isSidebarCollapsed,
  onOpenCrearDiarioRapido,
  onOpenCreatePublicacion,
  onOpenBackendGuide,
  onOpenEmergencia,
  idioma,
  onToggleIdioma,
  onSearchChange,
}) => {
  const isPsicologo = currentUser.id_rol === 2;
  const [logoError, setLogoError] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[#F8F9FA]/90 backdrop-blur-md border-b border-slate-200/70 px-3 sm:px-4 lg:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
      {/* LADO IZQUIERDO: Logo destacado + Nombre SERENA + Slogan */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Logo de SERENA: Mucho más visible y claro */}
        <div className="flex items-center gap-2.5">
          <div className="h-9 sm:h-10 w-auto flex items-center justify-center shrink-0">
            {!logoError ? (
              <img
                src="/IMG/logo.png"
                alt="SERENA Logo"
                className="h-full w-auto max-h-10 object-contain"
                onError={() => setLogoError(true)}
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-[#39A900] flex items-center justify-center text-white font-black text-base shadow-xs">
                S
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-extrabold text-lg tracking-tight text-slate-900">
                SERENA
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EBF7E6] text-[#2E8500] border border-[#39A900]/25">
                CMTC • SENA
              </span>
            </div>
            {/* Slogan solicitado: "Tu compañera Digital para el bienestar emocional" */}
            <span className="hidden xl:inline text-[10px] text-slate-500 font-medium tracking-tight mt-0.5">
              Tu compañera Digital para el bienestar emocional
            </span>
          </div>
        </div>
      </div>

      {/* LADO DERECHO: Botón de Emergencia LLAMATIVO SIN PARPADEAR + Acciones */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* BOTÓN DE EMERGENCIA: Visible y claro, SIN parpadeo molesto */}
        {onOpenEmergencia && (
          <button
            onClick={onOpenEmergencia}
            title={idioma === 'es' ? 'Atención en Crisis y Emergencia 24/7 (Línea 106)' : '24/7 Crisis Emergency'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs hover:shadow-sm transition-all duration-200 cursor-pointer shrink-0"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-white" />
            <span className="whitespace-nowrap tracking-wide">
              {idioma === 'es' ? 'SOS 24/7' : 'SOS 24/7'}
            </span>
            <span className="hidden sm:inline text-[10px] font-bold bg-white/20 text-white px-1.5 py-0.2 rounded-full">
              106
            </span>
          </button>
        )}
        {/* 5. Engranaje (Configuración) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            title={idioma === 'es' ? 'Configuración' : 'Settings'}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>

          {showSettings && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-2.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 pb-2 border-b border-slate-100 font-bold text-slate-800">
                {idioma === 'es' ? 'Configuración del Sistema' : 'System Settings'}
              </div>
              <button
                onClick={() => {
                  onOpenBackendGuide();
                  setShowSettings(false);
                }}
                className="w-full text-left px-3 py-2 text-slate-700 hover:bg-slate-50 flex items-center justify-between"
              >
                <span>{idioma === 'es' ? 'Arquitectura C# & Angular' : 'C# & Angular Architecture'}</span>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <div className="px-3 py-1.5 text-[10px] text-slate-400">
                SERENA v1.0 • CMTC Ficha 3288046
              </div>
            </div>
          )}
        </div>

        {/* 4. Símbolo de Traducción (Español / Inglés) */}
        <button
          onClick={onToggleIdioma}
          title={idioma === 'es' ? 'Cambiar a English' : 'Switch to Spanish'}
          className="h-8 px-2 rounded-full hover:bg-slate-100 flex items-center gap-1 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer text-xs font-semibold"
        >
          <Globe className="w-4 h-4 text-[#63C976]" />
          <span className="uppercase text-[11px] font-bold">{idioma}</span>
        </button>

        {/* 3. Botón de Acción Directa: "Diario" (Aprendiz) o "Publicación" (Psicólogo) */}
        {!isPsicologo ? (
          <button
            onClick={onOpenCrearDiarioRapido}
            title={idioma === 'es' ? 'Escribir nueva reflexión en tu diario' : 'Write new journal entry'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span className="whitespace-nowrap">{idioma === 'es' ? 'Diario' : 'Journal'}</span>
          </button>
        ) : (
          <button
            onClick={onOpenCreatePublicacion}
            title={idioma === 'es' ? 'Crear nueva publicación en el feed' : 'Create new post'}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-800 font-medium text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
            <span className="whitespace-nowrap">{idioma === 'es' ? 'Publicación' : 'Post'}</span>
          </button>
        )}

        {/* 2. Notificaciones (Campanita con badge) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowSettings(false);
              setShowUserMenu(false);
            }}
            title={idioma === 'es' ? 'Notificaciones' : 'Notifications'}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-700 hover:text-slate-900 transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#63C976] ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="font-bold text-slate-900 pb-2 mb-2 border-b border-slate-100 flex items-center justify-between">
                <span>{idioma === 'es' ? 'Notificaciones' : 'Notifications'}</span>
                <span className="text-[10px] text-[#47A95B] font-bold bg-[#ECF9EE] px-1.5 py-0.5 rounded">
                  2 {idioma === 'es' ? 'nuevas' : 'new'}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="font-bold text-slate-800">
                    {idioma === 'es' ? 'Cita con Dra. Laura Martínez' : 'Appointment with Dr. Laura'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {idioma === 'es' ? 'Lunes 09:00 AM - Consultorio Bienestar CMTC' : 'Mon 09:00 AM - Wellness Office'}
                  </p>
                </div>
                <div className="p-2 rounded-xl bg-purple-50/50 border border-purple-100">
                  <p className="font-bold text-purple-900">
                    {idioma === 'es' ? 'Nuevo tamizaje disponible' : 'New screening survey available'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {idioma === 'es' ? 'Encuesta sobre Carga Académica y Estrés' : 'Survey on Academic Stress'}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 1. Perfil (Icono de perfil / Avatar con selector de rol/usuario) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
              setShowSettings(false);
            }}
            title={`${currentUser.nombre_usuario} (${isPsicologo ? 'Psicólogo' : 'Aprendiz'})`}
            className="flex items-center gap-1.5 p-1 hover:bg-slate-100 rounded-full border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#63C976] to-[#EBADFF] text-white flex items-center justify-center font-bold text-xs overflow-hidden shadow-2xs">
              {currentUser.avatar_url ? (
                <img
                  src={currentUser.avatar_url}
                  alt={currentUser.nombre_usuario}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/IMG/cmtc_calmado.svg';
                  }}
                />
              ) : (
                <UserIcon className="w-4 h-4 text-white" />
              )}
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100">
                <p className="font-bold text-slate-900">{currentUser.nombre_usuario}</p>
                <p className="text-[11px] text-slate-500">{currentUser.email}</p>
                <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#ECF9EE] text-[#47A95B]">
                  {isPsicologo ? 'Psicólogo(a) Bienestar' : `Aprendiz Ficha ${currentUser.num_ficha}`}
                </span>
              </div>

              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                {idioma === 'es' ? 'Cambiar Rol de Prueba:' : 'Switch Test Role:'}
              </div>

              <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
                {usuariosDisponibles.map((u) => {
                  const isSelected = u.id_usuario === currentUser.id_usuario;
                  return (
                    <button
                      key={u.id_usuario}
                      onClick={() => {
                        onSelectUser(u);
                        setShowUserMenu(false);
                      }}
                      className={`text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[#ECF9EE] text-slate-900 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="truncate">
                        <p className="truncate font-semibold">{u.nombre_usuario}</p>
                        <p className="text-[10px] text-slate-400">
                          {u.id_rol === 2 ? 'Psicólogo' : 'Aprendiz'} • {u.centro}
                        </p>
                      </div>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#63C976]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
