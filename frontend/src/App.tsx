import React, { useState, useEffect } from 'react';
import { Usuario, Comunidad, Publicacion, EstadoDeAnimo, Cita, Formulario, Ficha, UsuarioFicha } from './types/serena.types';
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
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return false;
  });
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [usuariosDisponibles, setUsuariosDisponibles] = useState<Usuario[]>([]);
  const [fichasDisponibles, setFichasDisponibles] = useState<Ficha[]>([]);
  const [relacionesUsuarioFicha, setRelacionesUsuarioFicha] = useState<UsuarioFicha[]>([]);
  const [currentUser, setCurrentUser] = useState<Usuario>(() => serenaApi.getCurrentUser());

  // Configuración de interfaz
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [idioma, setIdioma] = useState<'es' | 'en'>('es');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem('serena_theme') === 'dark');

  // Navegación
  const [activeView, setActiveView] = useState<string>('home');
  const [selectedComunidadId, setSelectedComunidadId] = useState<string>('s/CMTC');

  // Estados reactivos sincronizados con serenaApi
  const [comunidades, setComunidades] = useState<Comunidad[]>(() => serenaApi.getComunidades());
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const [historialEstados, setHistorialEstados] = useState<EstadoDeAnimo[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [formularios, setFormularios] = useState<Formulario[]>([]);

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

  useEffect(() => {
    if (!isAuthenticated) {
      setUsuariosDisponibles([]);
      setFichasDisponibles([]);
      setRelacionesUsuarioFicha([]);
      return;
    }

    let active = true;
    const sessionGeneration = serenaApi.getSessionGeneration();
    const loadUsuarios = async () => {
      try {
        const [usuarios, fichas, relaciones] = await Promise.all([
          serenaApi.getUsuariosDesdeApi(),
          serenaApi.getFichasDesdeApi(),
          serenaApi.getUsuarioFichaDesdeApi(),
        ]);
        if (!active || sessionGeneration !== serenaApi.getSessionGeneration()) return;
        setUsuariosDisponibles(usuarios);
        setFichasDisponibles(fichas);
        setRelacionesUsuarioFicha(relaciones);
      } catch {
        if (!active || sessionGeneration !== serenaApi.getSessionGeneration()) return;
        setUsuariosDisponibles([]);
        setFichasDisponibles([]);
        setRelacionesUsuarioFicha([]);
      }
    };

    void loadUsuarios();
    return () => { active = false; };
  }, [isAuthenticated]);

  // Actualizar historial al cambiar usuario
  useEffect(() => {
    if (!isAuthenticated) {
      setHistorialEstados([]);
      return;
    }

    let active = true;
    const sessionGeneration = serenaApi.getSessionGeneration();
    const loadHistorialEstados = async () => {
      try {
        const estados = await serenaApi.getHistorialEstadosDesdeApi(currentUser.id_usuario);
        if (!active || sessionGeneration !== serenaApi.getSessionGeneration()) return;
        setHistorialEstados(estados);
      } catch {
        if (!active || sessionGeneration !== serenaApi.getSessionGeneration()) return;
        setHistorialEstados([]);
      }
    };

    void loadHistorialEstados();
    return () => { active = false; };
  }, [currentUser.id_usuario, isAuthenticated]);

  const handleLoginSuccess = (usuario: Usuario, token: string) => {
    setSessionToken(token);
    serenaApi.setAccessToken(token);
    serenaApi.setCurrentUser(usuario);
    setCurrentUser(usuario);
    setIsAuthenticated(true);
    setActiveView('home');
  };

  const handleLogout = () => {
    serenaApi.clearSessionData();
    setSessionToken(null);
    setCurrentUser(serenaApi.getCurrentUser());
    setUsuariosDisponibles([]);
    setFichasDisponibles([]);
    setRelacionesUsuarioFicha([]);
    setPublicaciones([]);
    setHistorialEstados([]);
    setCitas([]);
    setFormularios([]);
    setAprendizSeleccionado(undefined);
    setIsEmergenciaOpen(false);
    setIsCrearPubOpen(false);
    setIsCrearSubComunidadOpen(false);
    setIsExpedienteOpen(false);
    setIsBackendGuideOpen(false);
    setIsCrearDiarioRapidoOpen(false);
    setIsCrearCustomFeedOpen(false);
    setIsCrearReporteOpen(false);
    setRecursoModalType(null);
    setIsAuthenticated(false);
  };

  useEffect(() => {
    if (!sessionToken) return;
    const payload = sessionToken.split('.')[1];
    if (!payload) {
      handleLogout();
      return;
    }
    try {
      const base64Payload = payload.replace(/-/g, '+').replace(/_/g, '/');
      const normalizedPayload = base64Payload.padEnd(Math.ceil(base64Payload.length / 4) * 4, '=');
      const expiration = (JSON.parse(window.atob(normalizedPayload)) as { exp?: number }).exp;
      if (!expiration) {
        handleLogout();
        return;
      }
      const timeout = Math.max(0, expiration * 1000 - Date.now());
      const timer = window.setTimeout(handleLogout, timeout);
      return () => window.clearTimeout(timer);
    } catch {
      handleLogout();
    }
  }, [sessionToken]);

  const handleSelectComunidad = (comunidadId: string) => {
    setSelectedComunidadId(comunidadId);
    setActiveView('comunidad');
  };

  const handleVote = async (id_pub: number, delta: number) => {
    const publicacion = publicaciones.find((p) => p.id_publicaciones === id_pub);
    if (!publicacion) return;
    try {
      await serenaApi.votarPublicacionEnApi(publicacion, delta);
      await handleRefreshPublicaciones();
    } catch {
      // Si falla, se deja el estado actual
    }
  };

  const handleRefreshPublicaciones = async () => {
    if (!isAuthenticated) {
      setPublicaciones([]);
      return;
    }
    const sessionGeneration = serenaApi.getSessionGeneration();
    try {
      const data = await serenaApi.getPublicacionesDesdeApi(selectedComunidadId);
      if (sessionGeneration === serenaApi.getSessionGeneration()) setPublicaciones(data);
    } catch {
      if (sessionGeneration === serenaApi.getSessionGeneration()) setPublicaciones([]);
    }
  };

  const handleRefreshCitas = async () => {
    if (!isAuthenticated) {
      setCitas([]);
      return;
    }
    const sessionGeneration = serenaApi.getSessionGeneration();
    try {
      const data = await serenaApi.getCitasDesdeApi();
      if (sessionGeneration === serenaApi.getSessionGeneration()) setCitas(data);
    } catch {
      if (sessionGeneration === serenaApi.getSessionGeneration()) setCitas([]);
    }
  };

  useEffect(() => {
    void handleRefreshCitas();
    void handleRefreshPublicaciones();
  }, [selectedComunidadId, isAuthenticated]);

  const handleRefreshFormularios = async () => {
    try {
      setFormularios(await serenaApi.getFormulariosDesdeApi());
    } catch {
      setFormularios([]);
    }
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
    setActiveView('orientaciones');
  };

  const handleToggleIdioma = () => {
    setIdioma((prev) => (prev === 'es' ? 'en' : 'es'));
  };

  const handleToggleTheme = () => {
    setIsDarkMode((previous) => {
      const next = !previous;
      localStorage.setItem('serena_theme', next ? 'dark' : 'light');
      return next;
    });
  };

  useEffect(() => {
    if (currentUser.id_rol === 3 && activeView === 'home' &&
      !/^\/admin\/psicosocial\/\d+$/.test(window.location.pathname)) {
      window.history.replaceState({}, '', '/admin/dashboard');
    }
  }, [activeView, currentUser.id_rol]);

  const obtenerFichaUsuario = (usuario: Usuario) => {
    const relacion = relacionesUsuarioFicha.find((r) => r.id_usuario === usuario.id_usuario && r.estado !== false);
    if (relacion) {
      const fichaRelacionada = fichasDisponibles.find((f) => f.id_ficha === relacion.id_ficha);
      if (fichaRelacionada) return fichaRelacionada.codigo_ficha;
    }
    return usuario.num_ficha ?? null;
  };

  const fichaActualUsuario = obtenerFichaUsuario(currentUser);

  // Psicólogos y aprendices
  const psicologosDisponibles = usuariosDisponibles.filter((u) => {
    if (u.id_rol !== 2) return false;
    if (!fichaActualUsuario) return true;
    return obtenerFichaUsuario(u) === fichaActualUsuario;
  });
  const aprendicesDisponibles = usuariosDisponibles.filter((u) => {
    if (u.id_rol !== 1) return false;
    if (!fichaActualUsuario) return true;
    return obtenerFichaUsuario(u) === fichaActualUsuario;
  });
  const currentComunidad = comunidades.find((c) => c.id === selectedComunidadId) || comunidades[0];

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLoginSuccess} />;
  }

  return (
    <div className={isDarkMode ? 'dark h-screen overflow-hidden flex flex-col font-sans antialiased selection:bg-violet-900 selection:text-violet-100' : 'h-screen overflow-hidden bg-[#FAF9FF] text-slate-900 flex flex-col font-sans antialiased selection:bg-violet-100 selection:text-violet-900'}>
      {currentUser.id_rol === 3 ? (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5">
          <strong className="font-bold tracking-wide text-violet-800">SERENA · Administración</strong>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-600 sm:inline">{currentUser.nombre_usuario}</span>
            <button onClick={handleLogout} className="rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50">Cerrar sesión</button>
          </div>
        </header>
      ) : (
      <Header
        currentUser={currentUser}
        usuariosDisponibles={usuariosDisponibles}
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isSidebarCollapsed={isSidebarCollapsed}
        onOpenCrearDiarioRapido={() => setIsCrearDiarioRapidoOpen(true)}
        onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
        onOpenBackendGuide={() => setIsBackendGuideOpen(true)}
        onOpenEmergencia={() => setIsEmergenciaOpen(true)}
        onGoHome={() => setActiveView('home')}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        idioma={idioma}
        onToggleIdioma={handleToggleIdioma}
      />
      )}

      {/* Contenedor Principal: Sidebar Izquierdo Pinned Independiente + Feed Scroll */}
      <div className="flex-1 flex w-full overflow-hidden relative">
        {/* Sidebar Izquierdo con Movimiento Independiente */}
        {currentUser.id_rol !== 3 && <SidebarLeft
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
        />}

        {/* ÁREA DE CONTENIDO CENTRAL INDEPENDIENTE */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto bg-[#F8F9FA] p-3 sm:p-5 lg:p-6 relative">
          {currentUser.id_rol === 3 ? <AdminDashboard currentUser={currentUser} /> : <>
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
                onOpenAgendarCita={() => setActiveView('orientaciones')}
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
                onOpenCreatePublicacion={() => setIsCrearPubOpen(true)}
                onRefreshCitas={handleRefreshCitas}
                onSelectAprendizHistoria={handleAbrirExpediente}
                idioma={idioma}
              />
            )
          )}

          {activeView === 'estado_de_animo' && (
            <EstadoDeAnimoView
              currentUser={currentUser}
              historialEstados={historialEstados}
              onEstadoRegistrado={async () => {
                try {
                  const estados = await serenaApi.getHistorialEstadosDesdeApi(currentUser.id_usuario);
                  setHistorialEstados(estados);
                } catch {
                  setHistorialEstados([]);
                }
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

          {activeView === 'orientaciones' && (
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
                  void (async () => {
                    try {
                      await serenaApi.crearFormularioEnApi({
                        nombre_formulario: nombre,
                        descripcion: desc || 'Formulario de bienestar formativo',
                        id_usuario: currentUser.id_usuario,
                        preguntas_count: 5,
                        id_comunidad: 's/CMTC',
                        respondido: false,
                      });
                      await handleRefreshFormularios();
                    } catch (error) {
                      console.error(error);
                    }
                  })();
                }
              }}
            />
          )}

          {activeView === 'reportes' && (
            <div className="max-w-4xl mx-auto bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col gap-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-black text-lg text-slate-900">
                    Reportes institucionales
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
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">Orientaciones registradas</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-[#B95FE0]">{formularios.length}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">Formularios y encuestas</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-2xl font-black text-slate-800">{publicaciones.length}</p>
                  <p className="text-xs font-bold text-slate-500 uppercase mt-1">Publicaciones de Apoyo</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs text-slate-600">
                <p className="font-bold text-[#47A95B] mb-1">Registro Inmutable de Auditoría:</p>
                <p>
                  Toda consulta o modificación realizada en la historia clínica y estados de orientación queda almacenada con sello de tiempo e identificación del profesional psicosocial actuante conforme a la Ley 1090 de 2006.
                </p>
              </div>
            </div>
          )}
          </>}
        </main>
      </div>

      {/* MODALES DEL SISTEMA */}
      {currentUser.id_rol !== 3 && <>
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
        onPublicacionCreada={async (publicacion) => {
          const publicacionConAutor = {
            ...publicacion,
            autor: usuariosDisponibles.find((usuario) => usuario.id_usuario === publicacion.id_usuario),
          };
          setPublicaciones((actuales) => [publicacionConAutor, ...actuales]);
          await handleRefreshPublicaciones();
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
      </>}
    </div>
  );
}
