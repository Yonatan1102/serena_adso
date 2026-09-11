import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  X,
  User,
  FileText,
  Calendar,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowBigUp,
  ArrowBigDown,
  Lock,
  Tag,
  Stethoscope,
  Paperclip,
  ExternalLink,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import {
  Usuario,
  HistoriaClinica,
  Cita,
  CertificadoSoporte,
  AnotacionClinica,
  Publicacion,
} from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface ExpedienteClinicoModalProps {
  currentUser: Usuario;
  aprendiz: Usuario | null;
  isOpen: boolean;
  onClose: () => void;
  onRefreshCitas?: () => void;
}

export const ExpedienteClinicoModal: React.FC<ExpedienteClinicoModalProps> = ({
  currentUser,
  aprendiz,
  isOpen,
  onClose,
  onRefreshCitas,
}) => {
  if (!isOpen || !aprendiz) return null;

  // Validación de perfil profesional (RN-01)
  const esPsicologoOAdmin = currentUser.id_rol === 2 || currentUser.id_rol === 3;
  if (!esPsicologoOAdmin) {
    return (
      <div className="fixed inset-0 z-50 bg-[#F8F9FA] flex items-center justify-center p-6">
        <div className="max-w-md w-full text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="font-bold text-slate-900 text-base">Acceso Restringido (RN-01)</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Solo profesionales de psicología y bienestar autorizados por el SENA tienen permiso para consultar expedientes clínicos e historiales de aprendices.
          </p>
          <button
            onClick={onClose}
            className="mt-4 px-5 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Volver al panel
          </button>
        </div>
      </div>
    );
  }

  // Estados de datos
  const [historia, setHistoria] = useState<HistoriaClinica | undefined>(() =>
    serenaApi.getHistoriaClinica(aprendiz.id_usuario, currentUser.id_rol)
  );
  const [condiciones, setCondiciones] = useState<string[]>(() => {
    const h = serenaApi.getHistoriaClinica(aprendiz.id_usuario, currentUser.id_rol);
    if (h?.condiciones_lista && h.condiciones_lista.length > 0) return h.condiciones_lista;
    if (h?.condiciones) return h.condiciones.split(',').map((c) => c.trim()).filter(Boolean);
    return ['Estrés situacional reactivo'];
  });
  const [soportes, setSoportes] = useState<CertificadoSoporte[]>(() =>
    serenaApi.getSoportesClinicos(aprendiz.id_usuario)
  );
  const [anotaciones, setAnotaciones] = useState<AnotacionClinica[]>(() =>
    serenaApi.getAnotacionesClinicas(aprendiz.id_usuario)
  );
  const [citasAprendiz, setCitasAprendiz] = useState<Cita[]>(() => {
    const all = serenaApi.getCitas();
    return all.filter((c) => c.id_usuario_aprendiz === aprendiz.id_usuario);
  });
  const [votosUsuario, setVotosUsuario] = useState<{ upvotes: Publicacion[]; downvotes: Publicacion[] }>(() =>
    serenaApi.getVotosUsuario(aprendiz.id_usuario)
  );

  // Formulario para agregar condición
  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [showAddCondicion, setShowAddCondicion] = useState(false);

  // Formulario para nuevo comentario / evolución clínica
  const [nuevoComentarioTexto, setNuevoComentarioTexto] = useState('');
  const [tipoAnotacion, setTipoAnotacion] = useState<'Evolución' | 'Comentario' | 'Condición' | 'Acuerdo'>('Evolución');
  const [guardandoAnotacion, setGuardandoAnotacion] = useState(false);

  // Formulario para nuevo certificado médico
  const [showAddSoporte, setShowAddSoporte] = useState(false);
  const [nuevoSoporte, setNuevoSoporte] = useState({
    nombre_documento: '',
    entidad: '',
    medico_especialista: '',
    diagnostico_cie10: '',
    observaciones: '',
    tipo_archivo: 'PDF' as 'PDF' | 'DOCX' | 'JPG',
  });

  // Estado para añadir comentario a una cita específica
  const [comentarioCitaInputs, setComentarioCitaInputs] = useState<Record<number, string>>({});
  const [citaActivaComentario, setCitaActivaComentario] = useState<number | null>(null);

  // Pestaña activa para la sección de publicaciones
  const [tabVotos, setTabVotos] = useState<'upvotes' | 'downvotes'>('upvotes');

  // Mensaje de notificación temporal
  const [alertaExito, setAlertaExito] = useState<string | null>(null);

  const mostrarMensaje = (msg: string) => {
    setAlertaExito(msg);
    setTimeout(() => setAlertaExito(null), 3500);
  };

  // Recargar datos al cambiar de aprendiz
  useEffect(() => {
    if (aprendiz) {
      const h = serenaApi.getHistoriaClinica(aprendiz.id_usuario, currentUser.id_rol);
      setHistoria(h);
      if (h?.condiciones_lista && h.condiciones_lista.length > 0) {
        setCondiciones(h.condiciones_lista);
      } else if (h?.condiciones) {
        setCondiciones(h.condiciones.split(',').map((c) => c.trim()).filter(Boolean));
      } else {
        setCondiciones(['Estrés situacional reactivo']);
      }
      setSoportes(serenaApi.getSoportesClinicos(aprendiz.id_usuario));
      setAnotaciones(serenaApi.getAnotacionesClinicas(aprendiz.id_usuario));
      setCitasAprendiz(serenaApi.getCitas().filter((c) => c.id_usuario_aprendiz === aprendiz.id_usuario));
      setVotosUsuario(serenaApi.getVotosUsuario(aprendiz.id_usuario));
    }
  }, [aprendiz, currentUser]);

  // Manejo de condiciones
  const handleAgregarCondicion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaCondicion.trim()) return;
    const actualizadas = serenaApi.agregarCondicion(aprendiz.id_usuario, nuevaCondicion.trim());
    setCondiciones(actualizadas);
    setNuevaCondicion('');
    setShowAddCondicion(false);
    mostrarMensaje('Condición diagnóstica añadida al expediente.');
  };

  const handleEliminarCondicion = (cond: string) => {
    const actualizadas = serenaApi.eliminarCondicion(aprendiz.id_usuario, cond);
    setCondiciones(actualizadas);
    mostrarMensaje('Condición eliminada del registro.');
  };

  // Manejo de comentarios / anotaciones clínicas
  const handleGuardarAnotacion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoComentarioTexto.trim()) return;

    setGuardandoAnotacion(true);
    const nueva = serenaApi.agregarAnotacionClinica(
      aprendiz.id_usuario,
      currentUser.id_usuario,
      currentUser.nombre_usuario,
      tipoAnotacion,
      nuevoComentarioTexto.trim()
    );

    setAnotaciones((prev) => [nueva, ...prev]);
    setNuevoComentarioTexto('');
    setGuardandoAnotacion(false);
    mostrarMensaje('Comentario clínico guardado con firma profesional.');
  };

  // Manejo de soportes clínicos y certificados
  const handleGuardarSoporte = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoSoporte.nombre_documento.trim() || !nuevoSoporte.entidad.trim()) {
      alert('Por favor indica el nombre del documento y la entidad emisora.');
      return;
    }

    const creado = serenaApi.agregarSoporteClinico({
      id_usuario: aprendiz.id_usuario,
      nombre_documento: nuevoSoporte.nombre_documento.trim(),
      entidad: nuevoSoporte.entidad.trim(),
      medico_especialista: nuevoSoporte.medico_especialista.trim() || 'Médico tratante no especificado',
      diagnostico_cie10: nuevoSoporte.diagnostico_cie10.trim(),
      observaciones: nuevoSoporte.observaciones.trim(),
      tipo_archivo: nuevoSoporte.tipo_archivo,
      fecha_emision: new Date().toISOString().split('T')[0],
      tamano: '1.1 MB',
    });

    setSoportes((prev) => [creado, ...prev]);
    setNuevoSoporte({
      nombre_documento: '',
      entidad: '',
      medico_especialista: '',
      diagnostico_cie10: '',
      observaciones: '',
      tipo_archivo: 'PDF',
    });
    setShowAddSoporte(false);
    mostrarMensaje('Certificado médico registrado exitosamente.');
  };

  // Manejo de comentarios en citas
  const handleGuardarComentarioCita = (idCita: number) => {
    const texto = comentarioCitaInputs[idCita];
    if (!texto || !texto.trim()) return;

    serenaApi.agregarComentarioCita(idCita, texto.trim(), currentUser.nombre_usuario);
    const all = serenaApi.getCitas();
    setCitasAprendiz(all.filter((c) => c.id_usuario_aprendiz === aprendiz.id_usuario));
    setComentarioCitaInputs((prev) => ({ ...prev, [idCita]: '' }));
    setCitaActivaComentario(null);
    if (onRefreshCitas) onRefreshCitas();
    mostrarMensaje('Comentario registrado en la cita.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#F8F9FA] text-slate-900 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* =========================================================================
          BARRA DE NAVEGACIÓN SUPERIOR (Pantalla Completa)
          ========================================================================= */}
      <header className="bg-transparent border-b border-slate-200/60 px-6 sm:px-12 py-3.5 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 -ml-3 rounded-xl hover:bg-slate-200/50 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 text-slate-500 group-hover:-translate-x-0.5 transition-transform" />
            <span>Volver a Psicología</span>
          </button>

          <span className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800">
              Expediente Clínico y Acompañamiento
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700">
              Ley 1090/2006 • Reserva Profesional
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#39A900]" />
            <span>{currentUser.nombre_usuario}</span>
          </div>

          <button
            onClick={onClose}
            title="Cerrar vista"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Alerta de confirmación sutil flotante */}
      {alertaExito && (
        <div className="bg-[#EBF7E6] border-b border-[#39A900]/25 px-6 sm:px-12 py-2 text-xs text-[#2E8500] font-medium flex items-center gap-2 animate-in fade-in duration-150 shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{alertaExito}</span>
        </div>
      )}

      {/* =========================================================================
          CONTENIDO EXPANSIVO EN PANTALLA COMPLETA CON SCROLL DISIMULADO
          ========================================================================= */}
      <main className="flex-1 overflow-y-auto discreet-scroll px-6 sm:px-12 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto flex flex-col gap-10">

          {/* =======================================================================
              1. SECCIÓN PRINCIPAL DE IDENTIFICACIÓN DEL APRENDIZ (Sin marcos pesados)
              ======================================================================= */}
          <section className="flex flex-col gap-6 pb-6 border-b border-slate-200/60">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              {/* Avatar + Nombre + Estado */}
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#7E22CE]/10 text-[#7E22CE] flex items-center justify-center font-black text-2xl shrink-0 overflow-hidden">
                  {aprendiz.avatar_url ? (
                    <img
                      src={aprendiz.avatar_url}
                      alt={aprendiz.nombre_usuario}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    aprendiz.nombre_usuario.charAt(0)
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                      {aprendiz.nombre_usuario}
                    </h1>
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#EBF7E6] text-[#2E8500]">
                      Aprendiz Activo
                    </span>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-slate-200/60 text-slate-700">
                      {aprendiz.estado_formativo || 'Etapa Lectiva'}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 font-medium">
                    {aprendiz.programa_formacion || 'Análisis y Desarrollo de Software (ADSO)'}
                  </p>
                </div>
              </div>

              {/* Indicadores rápidos de actividad */}
              <div className="flex items-center gap-6 text-xs text-slate-500 self-start md:self-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Citas en Centro
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {citasAprendiz.length}
                  </span>
                </div>
                <span className="h-7 w-px bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Soportes Médicos
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {soportes.length}
                  </span>
                </div>
                <span className="h-7 w-px bg-slate-200" />
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase font-semibold tracking-wider text-slate-400">
                    Votos en Comunidad
                  </span>
                  <span className="text-lg font-bold text-slate-900">
                    {votosUsuario.upvotes.length + votosUsuario.downvotes.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Fila de datos ordenados: Documento, Ficha, Centro, Jornada, Correo, Teléfono */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 pt-4 text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Documento
                </span>
                <span className="font-semibold text-slate-800">
                  {aprendiz.tipo_documento || 'CC'} {aprendiz.documento || '1023456789'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Ficha SENA
                </span>
                <span className="font-semibold text-slate-800">
                  {aprendiz.num_ficha || '3288046'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Centro Formativo
                </span>
                <span className="font-semibold text-slate-800">
                  {aprendiz.centro} • Paloquemao
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Jornada
                </span>
                <span className="font-semibold text-slate-800">
                  {aprendiz.jornada || 'Diurna'}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Correo Electrónico
                </span>
                <span className="font-semibold text-slate-800 truncate" title={aprendiz.email}>
                  {aprendiz.email}
                </span>
              </div>

              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Teléfono
                </span>
                <span className="font-semibold text-slate-800">
                  {aprendiz.telefono || '+57 301 234 5678'}
                </span>
              </div>
            </div>
          </section>

          {/* =======================================================================
              2. DIVISIÓN EN DOS MITADES:
                 MITAD IZQUIERDA: HISTORIAL CLÍNICO Y CERTIFICADOS EXTERNOS
                 MITAD DERECHA: HISTORIAL DE CITAS EN EL CENTRO
              ======================================================================= */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-14 items-start">

            {/* ---------------------------------------------------------------------
                MITAD 1: HISTORIAL CLÍNICO (Condiciones, Certificados, Anotaciones)
                --------------------------------------------------------------------- */}
            <section className="flex flex-col gap-8">
              {/* Encabezado de la columna */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Historial Clínico
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Condiciones activas, certificados médicos externos y evolución clínica
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {soportes.length} certificado(s)
                </span>
              </div>

              {/* A. CONDICIONES DIAGNÓSTICAS */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-[#39A900]" />
                    Condiciones Registradas
                  </span>
                  {!showAddCondicion && (
                    <button
                      onClick={() => setShowAddCondicion(true)}
                      className="text-xs font-semibold text-[#2E8500] hover:text-[#39A900] flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar condición
                    </button>
                  )}
                </div>

                {/* Chips de condiciones */}
                <div className="flex flex-wrap gap-2 items-center">
                  {condiciones.length === 0 ? (
                    <span className="text-xs text-slate-400 italic">
                      Sin condiciones activas registradas en la historia clínica.
                    </span>
                  ) : (
                    condiciones.map((cond, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-200/50 text-slate-800 transition-colors"
                      >
                        <span>{cond}</span>
                        <button
                          onClick={() => handleEliminarCondicion(cond)}
                          title="Eliminar condición"
                          className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Formulario rápido para nueva condición */}
                {showAddCondicion && (
                  <form onSubmit={handleAgregarCondicion} className="flex items-center gap-2 mt-1">
                    <input
                      type="text"
                      value={nuevaCondicion}
                      onChange={(e) => setNuevaCondicion(e.target.value)}
                      placeholder="Ej: Ansiedad adaptativa, Tensión postural..."
                      className="flex-1 text-xs px-3.5 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#39A900]"
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#39A900] hover:bg-[#2E8500] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Guardar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddCondicion(false);
                        setNuevaCondicion('');
                      }}
                      className="px-3 py-2 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </form>
                )}
              </div>

              {/* B. CERTIFICADOS Y SOPORTES MÉDICOS EXTERNOS */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                    <Paperclip className="w-3.5 h-3.5 text-[#39A900]" />
                    Certificados y Soportes Médicos Externos
                  </span>
                  <button
                    onClick={() => setShowAddSoporte(!showAddSoporte)}
                    className="text-xs font-semibold text-[#2E8500] hover:text-[#39A900] flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {showAddSoporte ? 'Cerrar' : 'Adjuntar soporte'}
                  </button>
                </div>

                {/* Formulario para nuevo certificado */}
                {showAddSoporte && (
                  <form
                    onSubmit={handleGuardarSoporte}
                    className="p-4 bg-white/80 rounded-2xl border border-slate-200/80 flex flex-col gap-3 text-xs animate-in fade-in duration-150"
                  >
                    <div className="font-bold text-slate-800 text-xs">
                      Registrar Certificado / Soporte Externo
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Nombre del Documento *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevoSoporte.nombre_documento}
                          onChange={(e) =>
                            setNuevoSoporte({ ...nuevoSoporte, nombre_documento: e.target.value })
                          }
                          placeholder="Ej: Incapacidad Médica 3 Días"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Nombre de la Entidad Emisora *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevoSoporte.entidad}
                          onChange={(e) =>
                            setNuevoSoporte({ ...nuevoSoporte, entidad: e.target.value })
                          }
                          placeholder="Ej: EPS Sanitas, Compensar, SURA"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Médico Tratante / Especialista
                        </label>
                        <input
                          type="text"
                          value={nuevoSoporte.medico_especialista}
                          onChange={(e) =>
                            setNuevoSoporte({ ...nuevoSoporte, medico_especialista: e.target.value })
                          }
                          placeholder="Ej: Dr. Fernando Salazar (Psiquiatría)"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">
                          Diagnóstico CIE-10 (opcional)
                        </label>
                        <input
                          type="text"
                          value={nuevoSoporte.diagnostico_cie10}
                          onChange={(e) =>
                            setNuevoSoporte({ ...nuevoSoporte, diagnostico_cie10: e.target.value })
                          }
                          placeholder="Ej: F41.1 Ansiedad generalizada"
                          className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 block mb-1">
                        Observaciones Clínicas o Recomendaciones
                      </label>
                      <input
                        type="text"
                        value={nuevoSoporte.observaciones}
                        onChange={(e) =>
                          setNuevoSoporte({ ...nuevoSoporte, observaciones: e.target.value })
                        }
                        placeholder="Recomendaciones de pausas activas, flexibilización formativa, etc."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white"
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowAddSoporte(false)}
                        className="px-3 py-1.5 rounded-xl text-slate-500 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-[#39A900] hover:bg-[#2E8500] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        Guardar Soporte
                      </button>
                    </div>
                  </form>
                )}

                {/* Lista de certificados (Limpia, sin bordes pesados) */}
                <div className="flex flex-col divide-y divide-slate-200/60 max-h-[300px] overflow-y-auto discreet-scroll pr-1">
                  {soportes.length === 0 ? (
                    <div className="py-6 text-center text-slate-400 text-xs">
                      No hay certificados ni soportes médicos externos cargados aún.
                    </div>
                  ) : (
                    soportes.map((soporte) => (
                      <div
                        key={soporte.id_soporte}
                        className="py-3.5 flex flex-col gap-1.5 group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="font-bold text-xs text-slate-900">
                              {soporte.nombre_documento}
                            </span>
                            {/* Nombre de la entidad emisora destacado */}
                            <span className="text-xs font-semibold text-[#2E8500] flex items-center gap-1 mt-0.5">
                              <Building2 className="w-3.5 h-3.5" />
                              {soporte.entidad}
                            </span>
                          </div>

                          <span className="text-[11px] text-slate-400 shrink-0">
                            {soporte.fecha_emision}
                          </span>
                        </div>

                        {soporte.medico_especialista && (
                          <p className="text-[11px] text-slate-500">
                            <strong className="text-slate-700">Tratante:</strong> {soporte.medico_especialista}
                          </p>
                        )}

                        {soporte.diagnostico_cie10 && (
                          <div className="inline-flex">
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-200/60 text-slate-700">
                              CIE-10: {soporte.diagnostico_cie10}
                            </span>
                          </div>
                        )}

                        {soporte.observaciones && (
                          <p className="text-xs text-slate-600 leading-relaxed pt-0.5">
                            {soporte.observaciones}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                          <span>Archivo: {soporte.tipo_archivo} • {soporte.tamano || '850 KB'}</span>
                          <button
                            onClick={() =>
                              mostrarMensaje(`Visualizando soporte oficial emitido por ${soporte.entidad}.`)
                            }
                            className="text-[#2E8500] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Download className="w-3 h-3" />
                            Ver documento
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* C. ANOTACIONES CLÍNICAS Y NOTAS DE EVOLUCIÓN */}
              <div className="flex flex-col gap-3 pt-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5 text-[#39A900]" />
                  Anotaciones Clínicas y Notas de Evolución
                </span>

                {/* Formulario para redactar nota */}
                <form onSubmit={handleGuardarAnotacion} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-500">Tipo de nota:</span>
                    <div className="flex items-center gap-1">
                      {(['Evolución', 'Comentario', 'Acuerdo'] as const).map((tipo) => (
                        <button
                          key={tipo}
                          type="button"
                          onClick={() => setTipoAnotacion(tipo)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                            tipoAnotacion === tipo
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {tipo}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    rows={3}
                    value={nuevoComentarioTexto}
                    onChange={(e) => setNuevoComentarioTexto(e.target.value)}
                    placeholder="Redactar nota de evolución clínica, acuerdos o comentarios sobre el aprendiz..."
                    className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#39A900] leading-relaxed"
                  />

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">
                      Firmado por: <strong>{currentUser.nombre_usuario}</strong>
                    </span>
                    <button
                      type="submit"
                      disabled={guardandoAnotacion || !nuevoComentarioTexto.trim()}
                      className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Agregar nota
                    </button>
                  </div>
                </form>

                {/* Listado de anotaciones (Ordenado cronológico, limpio) */}
                <div className="flex flex-col divide-y divide-slate-200/60 max-h-[260px] overflow-y-auto discreet-scroll mt-2 pr-1">
                  {anotaciones.map((anot) => {
                    const fechaFmt = new Date(anot.fecha).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={anot.id_anotacion}
                        className="py-3 flex flex-col gap-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">{anot.nombre_psicologo}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700 font-semibold text-[10px]">
                              {anot.tipo}
                            </span>
                          </div>
                          <span className="text-slate-400">{fechaFmt}</span>
                        </div>
                        <p className="text-slate-700 text-xs leading-relaxed pt-0.5">{anot.contenido}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>

            {/* ---------------------------------------------------------------------
                MITAD 2: HISTORIAL DE CITAS EN EL CENTRO Y COMENTARIOS DE SESIÓN
                --------------------------------------------------------------------- */}
            <section className="flex flex-col gap-6">
              {/* Encabezado de la columna */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Historial de Citas
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Sesiones de acompañamiento psicológico agendadas en el CMTC
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-slate-400">
                  {citasAprendiz.length} sesión(es)
                </span>
              </div>

              {/* Lista ordenada de citas con comentarios */}
              <div className="flex flex-col divide-y divide-slate-200/60 max-h-[700px] overflow-y-auto discreet-scroll pr-2">
                {citasAprendiz.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    El aprendiz no tiene citas previas registradas con los psicólogos del centro.
                  </div>
                ) : (
                  citasAprendiz.map((cita) => {
                    const fechaObj = new Date(cita.fecha_hora);
                    const fechaFormateada = fechaObj.toLocaleDateString('es-CO', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    const psicologoAtendio =
                      cita.psicologo?.nombre_usuario ||
                      (cita.id_usuario_psicologo === 4
                        ? 'Dra. Laura Martínez'
                        : cita.id_usuario_psicologo === 5
                        ? 'Dr. Carlos Pardo'
                        : 'Psicología CMTC');

                    const badgeColor =
                      cita.estado_cita === 'Realizada'
                        ? 'text-[#581C87] bg-[#7E22CE]/10'
                        : cita.estado_cita === 'Confirmada'
                        ? 'text-[#2E8500] bg-[#39A900]/10'
                        : cita.estado_cita === 'Pendiente'
                        ? 'text-amber-800 bg-amber-50'
                        : 'text-slate-600 bg-slate-200/60';

                    const comentarios = cita.comentarios_sesion || [];

                    return (
                      <div
                        key={cita.id_cita}
                        className="py-4 flex flex-col gap-2.5"
                      >
                        {/* Cabecera de la Cita */}
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-slate-900">
                                {psicologoAtendio}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                • Psicología CMTC
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {fechaFormateada}
                            </p>
                          </div>

                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badgeColor}`}
                          >
                            {cita.estado_cita}
                          </span>
                        </div>

                        {/* Motivo de la Cita */}
                        <div className="text-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                            Motivo de la Sesión:
                          </span>
                          <p className="text-slate-800 font-medium mt-0.5">{cita.motivo}</p>
                        </div>

                        {/* Comentarios de la sesión */}
                        <div className="flex flex-col gap-1.5 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Anotaciones de la Sesión:
                            </span>
                            {citaActivaComentario !== cita.id_cita && (
                              <button
                                onClick={() => setCitaActivaComentario(cita.id_cita)}
                                className="text-[11px] font-bold text-[#7E22CE] hover:text-[#581C87] flex items-center gap-1 cursor-pointer"
                              >
                                <Plus className="w-3 h-3" />
                                Comentar en esta sesión
                              </button>
                            )}
                          </div>

                          {comentarios.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">
                              Sin comentarios registrados para esta sesión aún.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-1.5">
                              {comentarios.map((c, i) => (
                                <div
                                  key={i}
                                  className="text-xs text-slate-700 bg-slate-100/60 p-2.5 rounded-xl leading-relaxed"
                                >
                                  {c}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Formulario rápido para comentar en la cita */}
                          {citaActivaComentario === cita.id_cita && (
                            <div className="flex items-center gap-2 mt-1.5 animate-in fade-in duration-100">
                              <input
                                type="text"
                                value={comentarioCitaInputs[cita.id_cita] || ''}
                                onChange={(e) =>
                                  setComentarioCitaInputs({
                                    ...comentarioCitaInputs,
                                    [cita.id_cita]: e.target.value,
                                  })
                                }
                                placeholder="Escribe un comentario sobre esta sesión..."
                                className="flex-1 text-xs px-3 py-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-[#7E22CE]"
                                autoFocus
                              />
                              <button
                                onClick={() => handleGuardarComentarioCita(cita.id_cita)}
                                className="px-3.5 py-2 bg-[#7E22CE] hover:bg-[#581C87] text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                              >
                                Guardar
                              </button>
                              <button
                                onClick={() => setCitaActivaComentario(null)}
                                className="px-2 py-2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
                              >
                                Cancelar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>
          </div>

          {/* =======================================================================
              3. SECCIÓN INFERIOR: INTERACCIONES COMUNITARIAS DEL APRENDIZ
                 (Publicaciones con Upvoto y Downvoto, con pestañas limpias)
              ======================================================================= */}
          <section className="flex flex-col gap-5 pt-4 border-t border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Interacciones en la Comunidad (Foro SENA)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Publicaciones a las que el aprendiz ha dado voto positivo (Upvoto) o voto negativo (Downvoto)
                </p>
              </div>

              {/* Selector Upvotes / Downvotes */}
              <div className="flex items-center gap-1 bg-slate-200/60 p-1 rounded-xl self-start sm:self-auto">
                <button
                  onClick={() => setTabVotos('upvotes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tabVotos === 'upvotes'
                      ? 'bg-white text-[#2E8500] shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowBigUp className="w-4 h-4 fill-[#39A900] text-[#39A900]" />
                  <span>Upvotos ({votosUsuario.upvotes.length})</span>
                </button>

                <button
                  onClick={() => setTabVotos('downvotes')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    tabVotos === 'downvotes'
                      ? 'bg-white text-rose-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowBigDown className="w-4 h-4 fill-rose-500 text-rose-500" />
                  <span>Downvotos ({votosUsuario.downvotes.length})</span>
                </button>
              </div>
            </div>

            {/* Listado de publicaciones */}
            <div className="flex flex-col divide-y divide-slate-200/60">
              {tabVotos === 'upvotes' ? (
                votosUsuario.upvotes.length === 0 ? (
                  <div className="py-8 text-center text-slate-400 text-xs">
                    El aprendiz no ha emitido votos positivos (upvotes) en publicaciones de la comunidad.
                  </div>
                ) : (
                  votosUsuario.upvotes.map((pub) => (
                    <div
                      key={pub.id_publicaciones}
                      className="py-4 flex items-start gap-4 group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-[#EBF7E6] text-[#2E8500] flex items-center justify-center shrink-0">
                        <ArrowBigUp className="w-5 h-5 fill-[#39A900]" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span className="font-bold text-[#2E8500]">{pub.id_comunidad}</span>
                          <span>•</span>
                          <span>{pub.etiqueta || 'Bienestar'}</span>
                          <span>•</span>
                          <span>{new Date(pub.fecha_publicacion).toLocaleDateString('es-CO')}</span>
                        </div>

                        <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                          {pub.titulo}
                        </h3>

                        <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                          {pub.contenido}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                          <span className="font-medium text-slate-600">
                            Total votos: {pub.votos}
                          </span>
                          <span>•</span>
                          <span>{pub.comentarios || pub.comentarios_count || 0} comentarios</span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              ) : votosUsuario.downvotes.length === 0 ? (
                <div className="py-8 text-center text-slate-400 text-xs">
                  El aprendiz no ha emitido votos negativos (downvotes) en publicaciones de la comunidad.
                </div>
              ) : (
                votosUsuario.downvotes.map((pub) => (
                  <div
                    key={pub.id_publicaciones}
                    className="py-4 flex items-start gap-4 group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                      <ArrowBigDown className="w-5 h-5 fill-rose-500" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        <span className="font-bold text-rose-600">{pub.id_comunidad}</span>
                        <span>•</span>
                        <span>{pub.etiqueta || 'Debate'}</span>
                        <span>•</span>
                        <span>{new Date(pub.fecha_publicacion).toLocaleDateString('es-CO')}</span>
                      </div>

                      <h3 className="font-bold text-sm text-slate-900 mt-1 leading-snug">
                        {pub.titulo}
                      </h3>

                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {pub.contenido}
                      </p>

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-400">
                        <span className="font-medium text-slate-600">
                          Total votos: {pub.votos}
                        </span>
                        <span>•</span>
                        <span>{pub.comentarios || pub.comentarios_count || 0} comentarios</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          {/* Pie de página informativo legal */}
          <footer className="pt-6 pb-12 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              Toda modificación queda registrada con firma digital y marca de tiempo legal (Ley 1090/2006).
            </span>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Volver al Panel Principal
            </button>
          </footer>
        </div>
      </main>
    </div>
  );
};
