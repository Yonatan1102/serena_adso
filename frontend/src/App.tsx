import React, { useState, useEffect } from 'react';
import { Usuario, Comunidad, Publicacion, EstadoDeAnimo, Cita, Formulario } from './types/serena.types';
import { serenaApi } from './services/serena-api.service';
import { LoginView } from './components/LoginView';
import { Header } from './components/Header';
import { SidebarLeft } from './components/SidebarLeft';
import { HomeAprendiz } from './components/HomeAprendiz';
import { HomePsicologo } from './components/HomePsicologo';
import { EstadoDeAnimoView } from './components/EstadoDeAnimoView';
import { ComunidadView } from './components/ComunidadView';
import { CitasView } from './components/CitasView';
import { DiarioView } from './components/DiarioView';
import { FormulariosView } from './components/FormulariosView';
import { EmergenciaModal } from './components/EmergenciaModal';
import { CrearPublicacionModal } from './components/CrearPublicacionModal';
import { CrearSubComunidadModal } from './components/CrearSubComunidadModal';
import { ExpedienteClinicoModal } from './components/ExpedienteClinicoModal';
import { BackendIntegrationGuideModal } from './components/BackendIntegrationGuideModal';
import { CrearDiarioRapidoModal } from './components/CrearDiarioRapidoModal';
import { SitioEnConstruccionModal } from './components/SitioEnConstruccionModal';
import { CrearCustomFeedModal } from './components/CrearCustomFeedModal';
import { CrearReporteModal } from './components/CrearReporteModal';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return Boolean(localStorage.getItem('serena_access_token'));
  });

  const usuariosDisponibles = serenaApi.getUsuarios();
  const [currentUser, setCurrentUser] = useState<Usuario>(() => {
    const storedUser = localStorage.getItem('serena_current_user');
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as Usuario;
      } catch (_error) {
        // fall back to local default user
      }
    }
    return serenaApi.getCurrentUser();
  });

  // Configuración de interfaz
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');

  // Navegación
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedComunidadId, setSelectedComunidadId] = useState<string>('s/CMTC');

  // Estados reactivos sincronizados con serenaApi
  const [comunidades, setComunidades] = useState<Comunidad[]>(() => serenaApi.getComunidades());
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>(() => serenaApi.getPublicaciones());
  const [historialEstados, setHistorialEstados] = useState<EstadoDeAnimo[]>(() =>
    serenaApi.getHistorialEstados(currentUser.id_usuario)
  );
  const [citas, setCitas] = useState<Cita[]>(() => serenaApi.getCitas());
  const [formularios, setFormularios] = useState<Formulario[]>(() => serenaApi.getFormularios());

  // Modales
  const [isEmergenciaOpen, setIsEmergenciaOpen] = useState<boolean>(false);
  const [isCrearPubOpen, setIsCrearPubOpen] = useState<boolean>(false);
  const [isCrearSubComunidadOpen, setIsCrearSubComunidadOpen] = useState<boolean>(false);
  const [isExpedienteOpen, setIsExpedienteOpen] = useState<boolean>(false);
  const [isBackendGuideOpen, setIsBackendGuideOpen] = useState<boolean>(false);
  const [isCrearDiarioRapidoOpen, setIsCrearDiarioRapidoOpen] = useState<boolean>(false);
  const [isCrearCustomFeedOpen, setIsCrearCustomFeedOpen] = useState<boolean>(false);
  const [isCrearReporteOpen, setIsCrearReporteOpen] = useState<boolean>(false);
  const [recursoModalType, setRecursoModalType] = useState<'about' | 'blog' | 'help' | null>(null);

  const [aprendizSeleccionado, setAprendizSeleccionado] = useState<Usuario | undefined>(undefined);

  // Actualizar historial al cambiar usuario
  useEffect(() => {
    setHistorialEstados(serenaApi.getHistorialEstados(currentUser.id_usuario));
  }, [currentUser]);

  const handleSelectUser = (user: Usuario) => {
    serenaApi.setCurrentUser(user);
    setCurrentUser(user);
    setActiveView('home');
  };

  const handleLoginSuccess = (usuario: Usuario, token: string) => {
    localStorage.setItem('serena_access_token', token);
    serenaApi.setCurrentUser(usuario);
    setCurrentUser(usuario);
    setIsAuthenticated(true);
    setActiveView('home');
  };

  const handleSelectComunidad = (comunidadId: string) => {
    setSelectedComunidadId(comunidadId);
    setActiveView('comunidad');
  };

  const handleVote = (id_pub: number, delta: number) => {
    serenaApi.votarPublicacion(id_pub, delta, currentUser.id_usuario);
    setPublicaciones([...serenaApi.getPublicaciones()]);
  };

  const handleRefreshCitas = () => {
    setCitas([...serenaApi.getCitas()]);
  };

  const handleRefreshFormularios = () => {
    setFormularios([...serenaApi.getFormularios()]);
  };

  const handleAbrirExpediente = (aprendiz: Usuario) => {
    setAprendizSeleccionado(aprendiz);
    setIsExpedienteOpen(true);
  };

  const handleAbrirDiarioAprendiz = (aprendiz: Usuario) => {
    setAprendizSeleccionado(aprendiz);
    setActiveView('diario');
  };

  const handleAgendarConPsicologo = (_psicologo: Usuario) => {
    setActiveView('citas');
  };

  const handleToggleIdioma = () => {
    setIdioma((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  // Psicólogos y aprendices
  const psicologosDisponibles = usuariosDisponibles.filter((u) => u.id_rol === 2);
  const aprendicesDisponibles = usuariosDisponibles.filter((u) => u.id_rol === 1);
  const currentComunidad = comunidades.find((c) => c.id === selectedComunidadId) || comunidades[0];

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen overflow-hidden bg-[#F8F9FA] text-slate-900 flex flex-col font-sans antialiased selection:bg-[#EBF7E6] selection:text-[#2E8500]">
      {/* Header Superior Estilo Reddit */}
      <Header
        currentUser={currentUser}
        usuariosDisponibles={usuariosDisponibles}
        onSelectUser={handleSelectUser}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenCrearDiarioRapido={() => setIsCrearDiarioRapidoOpen(true)}
        onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
        onOpenBackendGuide={() => setIsBackendGuideOpen(true)}
        onOpenEmergencia={() => setIsEmergenciaOpen(true)}
        idioma={idioma}
        onToggleIdioma={handleToggleIdioma}
      />

      {/* Contenedor Principal: Sidebar Izquierdo Pinned Independiente + Feed Scroll */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Sidebar Izquierdo con Movimiento Independiente */}
        <SidebarLeft
          currentUser={currentUser}
          activeView={activeView}
          setActiveView={setActiveView}
          comunidades={comunidades}
          selectedComunidadId={selectedComunidadId}
          onSelectComunidad={handleSelectComunidad}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
          onOpenCreateSubComunidad={() => setIsCrearSubComunidadOpen(true)}
          onOpenCreateFormulario={() => {
            setActiveView('formularios');
          }}
          onOpenCreateCustomFeed={() => setIsCrearCustomFeedOpen(true)}
          onOpenCreateReporte={() => setIsCrearReporteOpen(true)}
          onOpenRecursoModal={(tipo) => setRecursoModalType(tipo)}
          idioma={idioma}
        />

        {/* ÁREA DE CONTENIDO CENTRAL INDEPENDIENTE */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F8F9FA] p-3 sm:p-5 lg:p-6 relative">
          {activeView === 'home' && (
            currentUser.id_rol === 1 ? (
              <HomeAprendiz
                currentUser={currentUser}
                publicaciones={publicaciones}
                psicologoAsignado={psicologosDisponibles[0]}
                ultimoEstadoAnimo={historialEstados[historialEstados.length - 1]}
                formulariosPendientes={formularios}
                onVote={handleVote}
                onOpenEmergencia={() => setIsEmergenciaOpen(true)}
                onOpenEstadoAnimo={() => setActiveView('estado_de_animo')}
                onOpenAgendarCita={() => setActiveView('citas')}
                onOpenFormularios={() => setActiveView('formularios')}
                onSelectComunidad={handleSelectComunidad}
                idioma={idioma}
              />
            ) : (
              <HomePsicologo
                currentUser={currentUser}
                citas={citas}
                publicaciones={publicaciones}
                aprendicesSeguimiento={aprendicesDisponibles}
                emergencias={serenaApi.getEmergencias()}
                onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
                onOpenCreateFormulario={() => setActiveView('formularios')}
                onRefreshCitas={handleRefreshCitas}
                onSelectAprendizDiario={handleAbrirDiarioAprendiz}
                onSelectAprendizHistoria={handleAbrirExpediente}
                onVote={handleVote}
                idioma={idioma}
              />
            )
          )}

          {activeView === 'estado_de_animo' && (
            <EstadoDeAnimoView
              currentUser={currentUser}
              historialEstados={historialEstados}
              onEstadoRegistrado={() => {
                setHistorialEstados(serenaApi.getHistorialEstados(currentUser.id_usuario));
              }}
            />
          )}

          {activeView === 'comunidad' && (
            <ComunidadView
              comunidad={currentComunidad}
              currentUser={currentUser}
              publicaciones={publicaciones}
              onVote={handleVote}
              onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
              onOpenAgendarConPsicologo={handleAgendarConPsicologo}
              onOpenCreateSubComunidad={() => setIsCrearSubComunidadOpen(true)}
            />
          )}

          {activeView === 'explorar' && (
            <ComunidadView
              comunidad={currentComunidad}
              currentUser={currentUser}
              publicaciones={publicaciones}
              onVote={handleVote}
              onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
              onOpenAgendarConPsicologo={handleAgendarConPsicologo}
              onOpenCreateSubComunidad={() => setIsCrearSubComunidadOpen(true)}
            />
          )}

          {activeView === 'citas' && (
            <CitasView
              currentUser={currentUser}
              citas={citas}
              psicologosDisponibles={psicologosDisponibles}
              aprendices={aprendicesDisponibles}
              onRefreshCitas={handleRefreshCitas}
            />
          )}

          {activeView === 'diario' && (
            <DiarioView
              currentUser={currentUser}
              aprendizSeleccionado={aprendizSeleccionado}
              onVolver={aprendizSeleccionado ? () => setActiveView('home') : undefined}
            />
          )}

          {activeView === 'formularios' && (
            <FormulariosView
              currentUser={currentUser}
              formularios={formularios}
              onRefreshFormularios={handleRefreshFormularios}
              onOpenCreateFormulario={() => {
                const nombre = prompt('Ingresa el título del nuevo formulario para el CMTC:');
                if (nombre) {
                  const desc = prompt('Ingresa una breve descripción:');
                  serenaApi.crearFormulario(
                    nombre,
                    desc || 'Formulario de bienestar formativo',
                    currentUser.id_usuario,
                    5,
                    's/CMTC'
                  );
                  handleRefreshFormularios();
                  alert('¡Formulario publicado para los aprendices del CMTC!');
                }
              }}
            />
          )}

          {activeView === 'reportes' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-black text-lg text-slate-900">
                    Reportes y Trazabilidad Institucional
                  </h2>
                  <p className="text-xs text-slate-500">
                    Centro CMTC • Ficha ADSO 3288046 • Bienestar al Aprendiz
                  </p>
                </div>
                <button
                  onClick={() => setIsCrearReporteOpen(true)}
                  className="px-4 py-2 bg-[#63C976] hover:bg-[#47A95B] text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all"
                >
                  Exportar Nuevo Reporte
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-[#47A95B]">{citas.length}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">Citas Registradas</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-[#B95FE0]">{formularios.length}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">Formularios / Tamizajes</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-slate-800">{publicaciones.length}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">Publicaciones de Apoyo</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-600">
                <p className="font-bold text-[#47A95B] mb-1">Registro Inmutable de Auditoría:</p>
                <p>
                  Toda consulta o modificación realizada en la historia clínica y estados de cita queda almacenada con sello de tiempo e identificación del psicólogo actuante conforme a la Ley 1090 de 2006.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALES DEL SISTEMA */}
      <EmergenciaModal
        currentUser={currentUser}
        isOpen={isEmergenciaOpen}
        onClose={() => setIsEmergenciaOpen(false)}
      />

      <CrearPublicacionModal
        currentUser={currentUser}
        comunidades={comunidades}
        defaultComunidadId={selectedComunidadId}
        isOpen={isCrearPubOpen}
        onClose={() => setIsCrearPubOpen(false)}
        onPublicacionCreada={() => {
          setPublicaciones([...serenaApi.getPublicaciones()]);
        }}
      />

      <CrearSubComunidadModal
        currentUser={currentUser}
        isOpen={isCrearSubComunidadOpen}
        onClose={() => setIsCrearSubComunidadOpen(false)}
        onComunidadCreada={(nuevaId) => {
          setComunidades([...serenaApi.getComunidades()]);
          setSelectedComunidadId(nuevaId);
          setActiveView('comunidad');
        }}
      />

      <CrearDiarioRapidoModal
        currentUser={currentUser}
        isOpen={isCrearDiarioRapidoOpen}
        onClose={() => setIsCrearDiarioRapidoOpen(false)}
        onSaved={() => {
          if (activeView === 'diario') {
            setActiveView('home');
            setTimeout(() => setActiveView('diario'), 50);
          }
        }}
        idioma={idioma}
      />

      <CrearCustomFeedModal
        isOpen={isCrearCustomFeedOpen}
        onClose={() => setIsCrearCustomFeedOpen(false)}
        comunidades={comunidades}
        onFeedCreated={() => {
          // refrescar feeds
        }}
        idioma={idioma}
      />

      <CrearReporteModal
        isOpen={isCrearReporteOpen}
        onClose={() => setIsCrearReporteOpen(false)}
        currentUser={currentUser}
        idioma={idioma}
      />

      {recursoModalType && (
        <SitioEnConstruccionModal
          isOpen={!!recursoModalType}
          onClose={() => setRecursoModalType(null)}
          tipo={recursoModalType}
          idioma={idioma}
        />
      )}

      {aprendizSeleccionado && (
        <ExpedienteClinicoModal
          currentUser={currentUser}
          aprendiz={aprendizSeleccionado}
          isOpen={isExpedienteOpen}
          onClose={() => {
            setIsExpedienteOpen(false);
            setAprendizSeleccionado(undefined);
          }}
          onRefreshCitas={handleRefreshCitas}
        />
      )}

      <BackendIntegrationGuideModal
        isOpen={isBackendGuideOpen}
        onClose={() => setIsBackendGuideOpen(false)}
      />

      {/* Botón flotante persistente de emergencia 24/7 (Sólido y visible, sin parpadeos) */}
      <button
        onClick={() => setIsEmergenciaOpen(true)}
        title={idioma === 'es' ? 'Atención en Crisis y Emergencia 24/7 (Línea 106 / SENA)' : '24/7 Crisis Support (Line 106)'}
        aria-label="Botón de emergencia 24/7"
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-900/20 border border-red-500 cursor-pointer transition-all duration-200"
      >
        <span className="w-2 h-2 rounded-full bg-white" />
        <span className="tracking-wide">SOS 24/7</span>
        <span className="hidden sm:inline text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">
          Línea 106
        </span>
      </button>
    </div>
  );
}
