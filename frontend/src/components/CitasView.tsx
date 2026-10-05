import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Clock,
  User,
  CalendarPlus,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Plus,
  Send,
  History,
} from 'lucide-react';
import { Usuario, Cita, Disponibilidad } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';
import { RecaptchaV2 } from './RecaptchaV2';

interface CitasViewProps {
  currentUser: Usuario;
  citas: Cita[];
  psicologosDisponibles: Usuario[];
  aprendices: Usuario[];
  onRefreshCitas: () => void;
}

export const CitasView: React.FC<CitasViewProps> = ({
  currentUser,
  citas = [],
  psicologosDisponibles = [],
  aprendices = [],
  onRefreshCitas,
}) => {
  const isPsicologo = currentUser.id_rol === 2;

  // Formulario de agendamiento para aprendiz
  const defaultPsico = (psicologosDisponibles || [])[0];
  const [psicologoSeleccionadoId, setPsicologoSeleccionadoId] = useState<number>(0);

  // Sincroniza el profesional con los datos reales que llegan de la API (evita IDs mock como 4)
  useEffect(() => {
    if (psicologoSeleccionadoId === 0 && psicologosDisponibles.length > 0) {
      setPsicologoSeleccionadoId(psicologosDisponibles[0].id_usuario);
    }
  }, [psicologosDisponibles, psicologoSeleccionadoId]);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [agendando, setAgendando] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [disponibilidadesPsico, setDisponibilidadesPsico] = useState<Disponibilidad[]>([]);
  const diaSeleccionado = fechaSeleccionada
    ? (new Date(`${fechaSeleccionada}T12:00:00`).getDay() + 6) % 7 + 1
    : null;
  const franjasDisponiblesPsico = disponibilidadesPsico
    .filter((slot) => slot.estado !== false && slot.dia_semana === diaSeleccionado)
    .map((slot) => slot.hora_inicio.slice(0, 5));

  // Psicólogo seleccionado para ver su disponibilidad
  const psicoActivo = (psicologosDisponibles || []).find((p) => p.id_usuario === psicologoSeleccionadoId) || defaultPsico;

  useEffect(() => {
    const cargarFranjas = async () => {
      if (!psicoActivo?.id_usuario) {
        setDisponibilidadesPsico([]);
        return;
      }

      try {
        const disponibilidad: Disponibilidad[] = await serenaApi.getDisponibilidadPorUsuarioDesdeApi(psicoActivo.id_usuario);
        setDisponibilidadesPsico(disponibilidad);
      } catch {
        setDisponibilidadesPsico([]);
      }
    };

    void cargarFranjas();
  }, [psicoActivo]);

  const handleAgendarAprendiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!psicologoSeleccionadoId) {
      setMensaje('No hay profesionales psicosociales registrados para solicitar una orientación.');
      return;
    }
    if (!fechaSeleccionada || !franjaSeleccionada || !motivo.trim()) {
      setMensaje('Selecciona una fecha, una franja disponible y describe brevemente el motivo.');
      return;
    }
    if (!recaptchaToken) {
      setMensaje('Completa la verificación reCAPTCHA para enviar la solicitud.');
      return;
    }
    if (!franjasDisponiblesPsico.includes(franjaSeleccionada)) {
      setMensaje('La franja seleccionada ya no está disponible. Actualiza la disponibilidad e inténtalo nuevamente.');
      return;
    }

    setMensaje(null);
    setAgendando(true);
    const fechaHoraCompleta = `${fechaSeleccionada}T${franjaSeleccionada}:00.000Z`;

    try {
      await serenaApi.agendarCitaEnApi({
        fecha_hora: fechaHoraCompleta,
        motivo: motivo.trim(),
        estado_cita: 'Pendiente',
        id_usuario_aprendiz: currentUser.id_usuario,
        id_usuario_psicologo: psicologoSeleccionadoId,
        recaptchaToken,
      });
      setAgendando(false);
      setMotivo('');
      setFechaSeleccionada('');
      setFranjaSeleccionada('');
      await onRefreshCitas();
      setMensaje('Orientación solicitada. El profesional psicosocial asignado la confirmará en breve.');
    } catch (error) {
      setAgendando(false);
      setMensaje(error instanceof Error ? error.message : 'No se pudo guardar la orientación.');
    } finally {
      setRecaptchaToken('');
      setCaptchaVersion((current) => current + 1);
    }
  };

  const misCitas = isPsicologo
    ? (citas || []).filter((c) => c.id_usuario_psicologo === currentUser.id_usuario)
    : (citas || []).filter((c) => c.id_usuario_aprendiz === currentUser.id_usuario);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12">
      {/* Cabecera del Módulo de Citas */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          {mensaje && (
            <div className="rounded-xl border border-violet-100 bg-violet-50 px-4 py-3 text-xs text-violet-800">
              {mensaje}
            </div>
          )}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isPsicologo ? 'Gestión de orientaciones psicosociales' : 'Solicitud de orientaciones de bienestar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isPsicologo
              ? 'Controla las solicitudes de orientación, actualiza estados con auditoría inmutable y envía orientaciones a aprendices.'
              : 'Selecciona la franja de disponibilidad de tu psicosocial asignado en el Centro CMTC para programar tu sesión de acompañamiento.'}
          </p>
        </div>
      </div>

      {/* VISTA ESPECÍFICA DE APRENDIZ: FORMULARIO DE AGENDAMIENTO CON FRANJAS DISPONIBLES */}
      {!isPsicologo && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Tarjeta del Profesional Asignado y su Disponibilidad */}
          <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col justify-between gap-3">
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                Profesional psicosocial asignado
              </h3>

              {psicoActivo && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-base">
                      {psicoActivo.nombre_usuario.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs sm:text-sm text-slate-900">
                        {psicoActivo.nombre_usuario}
                      </h4>
                      <p className="text-xs text-[#7E22CE] font-medium">
                        {psicoActivo.especialidad}
                      </p>
                      <p className="text-[10px] text-slate-400">Centro {psicoActivo.centro}</p>
                    </div>
                  </div>

                  <div className="rounded-xl p-2.5 bg-slate-50/70 border border-slate-100 text-xs text-slate-600 flex flex-col gap-1.5 mt-0.5">
                    <div className="flex items-center gap-1.5 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-[#39A900]" />
                      <span>{psicoActivo.horario_atencion}</span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Contacto: <span className="text-slate-700">{psicoActivo.email}</span>
                    </p>
                  </div>

                  <div className="mt-1">
                    <p className="text-xs font-semibold text-slate-700 mb-1.5">
                      Franjas disponibles:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(franjasDisponiblesPsico.length > 0 ? franjasDisponiblesPsico : ['Selecciona una fecha con disponibilidad']).map((franja) => (
                        <span
                          key={`${psicoActivo.id_usuario}-${franja}`}
                          className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-medium"
                        >
                          {franja}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-400">
              Ubicación: Consultorio Bienestar al Aprendiz, Edificio Central CMTC.
            </div>
          </div>

          {/* Formulario de Agendamiento */}
          <div className="lg:col-span-2 bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-3">
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 mb-0.5 flex items-center gap-2">
                <CalendarPlus className="w-4 h-4 text-[#7E22CE]" />
                <span>Solicitar una orientación</span>
              </h3>
              <p className="text-xs text-slate-400">
                Diligencia la fecha y el motivo. Tu solicitud quedará en estado "Pendiente" hasta confirmación del profesional.
              </p>
            </div>

            <form onSubmit={handleAgendarAprendiz} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profesional psicosocial:
                  </label>
                  <select
                    value={psicologoSeleccionadoId}
                    onChange={(e) => setPsicologoSeleccionadoId(Number(e.target.value))}
                    disabled={psicologosDisponibles.length === 0}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-normal disabled:opacity-60"
                  >
                    {psicologosDisponibles.length === 0 ? (
                      <option value={0}>No hay profesionales disponibles</option>
                    ) : (
                      psicologosDisponibles.map((p) => (
                        <option key={p.id_usuario} value={p.id_usuario}>
                          {p.nombre_usuario} - {p.especialidad || 'Bienestar'}
                        </option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha deseada:
                  </label>
                  <input
                    type="date"
                    required
                    value={fechaSeleccionada}
                    onChange={(e) => { setFechaSeleccionada(e.target.value); setFranjaSeleccionada(''); }}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Franja horaria disponible:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {franjasDisponiblesPsico.map((hora) => (
                    <button
                      key={`${psicoActivo?.id_usuario ?? 'psico'}-${hora}`}
                      type="button"
                      onClick={() => setFranjaSeleccionada(hora)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-medium transition-colors border cursor-pointer ${
                        franjaSeleccionada === hora
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {hora}
                    </button>
                  ))}
                  {franjasDisponiblesPsico.length === 0 && (
                    <p className="col-span-full text-xs text-slate-500">
                      {fechaSeleccionada ? 'No hay franjas disponibles para este día.' : 'Selecciona una fecha para consultar las franjas disponibles.'}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de la orientación (Confidencial):
                </label>
                <textarea
                  rows={2}
                  required
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder="Describe brevemente el motivo de tu consulta..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:outline-none focus:border-[#7E22CE]"
                />
              </div>

              <RecaptchaV2 key={captchaVersion} onToken={setRecaptchaToken} />

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#39A900]" />
                  La consulta es confidencial bajo ética profesional
                </span>

                <button
                  type="submit"
                  disabled={agendando}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <CalendarCheck className="w-3.5 h-3.5" />
                  <span>{agendando ? 'Enviando...' : 'Solicitar orientación'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LISTADO DE CITAS DEL USUARIO (Historial y Próximas) */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Historial de orientaciones registradas
            </h3>
            <p className="text-xs text-slate-400">
              Estados disponibles: Pendiente, Confirmada, Realizada o Cancelada
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {misCitas.length} orientaciones
          </span>
        </div>

        {misCitas.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No tienes orientaciones agendadas en este momento.
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {misCitas.map((cita) => {
              const fecha = new Date(cita.fecha_hora);
              const badgeColor =
                cita.estado_cita === 'Confirmada'
                  ? 'bg-[#EBF7E6] text-[#2E8500]'
                  : cita.estado_cita === 'Pendiente'
                  ? 'bg-amber-50 text-amber-800'
                  : cita.estado_cita === 'Realizada'
                  ? 'bg-slate-100 text-slate-700'
                  : 'bg-rose-50 text-rose-800';

              return (
                <div
                  key={cita.id_cita}
                  className="p-3.5 rounded-xl border border-slate-100 bg-white/60 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-xs font-bold text-slate-900">
                        {isPsicologo
                          ? `Aprendiz: ${cita.aprendiz?.nombre_usuario || 'Aprendiz CMTC'}`
                          : `Con: ${cita.psicologo?.nombre_usuario || 'Psicosocial Bienestar'}`}
                      </span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${badgeColor}`}>
                        {cita.estado_cita}
                      </span>
                      {cita.es_solicitud_sin_agendar && (
                        <span className="text-[9px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Invitación abierta
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600">{cita.motivo}</p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1.5 font-normal">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {fecha.toLocaleDateString('es-CO', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {isPsicologo && (cita.estado_cita === 'Pendiente' || cita.estado_cita === 'Confirmada') && (
                    <div className="flex items-center gap-2 shrink-0">
                      {cita.estado_cita === 'Pendiente' && (
                        <button
                          onClick={async () => {
                            try {
                              await serenaApi.cambiarEstadoCitaEnApi(cita, 'Confirmada');
                              await onRefreshCitas();
                            } catch (error) {
                              setMensaje(error instanceof Error ? error.message : 'No se pudo actualizar la orientación.');
                            }
                          }}
                          className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                        >
                          Confirmar
                        </button>
                      )}
                      <button
                        onClick={async () => {
                          const motivo = window.prompt('Indica el motivo de cancelación de la orientación:')?.trim();
                          if (!motivo) return;
                          try {
                            await serenaApi.cambiarEstadoCitaEnApi(cita, 'Cancelada', motivo);
                            await onRefreshCitas();
                          } catch (error) {
                            setMensaje(error instanceof Error ? error.message : 'No se pudo cancelar la orientación.');
                          }
                        }}
                        className="px-3 py-1 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-medium cursor-pointer"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
