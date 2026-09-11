import React, { useState } from 'react';
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
import { Usuario, Cita } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

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
  const [psicologoSeleccionadoId, setPsicologoSeleccionadoId] = useState<number>(defaultPsico?.id_usuario || 4);
  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>('');
  const [franjaSeleccionada, setFranjaSeleccionada] = useState<string>('');
  const [motivo, setMotivo] = useState<string>('');
  const [agendando, setAgendando] = useState<boolean>(false);

  // Psicólogo seleccionado para ver su disponibilidad
  const psicoActivo = (psicologosDisponibles || []).find((p) => p.id_usuario === psicologoSeleccionadoId) || defaultPsico;

  const handleAgendarAprendiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fechaSeleccionada || !motivo.trim()) {
      alert('Por favor selecciona una fecha y redacta el motivo de la consulta.');
      return;
    }

    setAgendando(true);
    const fechaHoraCompleta = `${fechaSeleccionada}T${franjaSeleccionada || '09:00'}:00.000Z`;

    serenaApi.agendarCita(
      currentUser.id_usuario,
      psicologoSeleccionadoId,
      fechaHoraCompleta,
      motivo
    );

    setTimeout(() => {
      setAgendando(false);
      setMotivo('');
      setFechaSeleccionada('');
      setFranjaSeleccionada('');
      onRefreshCitas();
      alert('¡Cita solicitada exitosamente! Tu psicólogo asignado la confirmará en breve.');
    }, 400);
  };

  const misCitas = isPsicologo
    ? (citas || []).filter((c) => c.id_usuario_psicologo === currentUser.id_usuario)
    : (citas || []).filter((c) => c.id_usuario_aprendiz === currentUser.id_usuario);

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12">
      {/* Cabecera del Módulo de Citas */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87] font-semibold text-xs">
              Módulo de Citas y Trazabilidad
            </span>
            <span className="text-xs text-slate-400">• RF-CIT-01 & RF-CIT-02</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {isPsicologo ? 'Gestión de Citas y Agenda Psicológica' : 'Agendamiento de Citas de Bienestar'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            {isPsicologo
              ? 'Controla las solicitudes de orientación, actualiza estados con auditoría inmutable y envía citas a aprendices.'
              : 'Selecciona la franja de disponibilidad de tu psicólogo asignado en el Centro CMTC para programar tu sesión de acompañamiento.'}
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
                Psicólogo(a) Asignado(a)
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
                      Franjas habituales disponibles:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {psicoActivo.disponibilidad?.map((franja) => (
                        <span
                          key={franja}
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
                <span>Programar Nueva Sesión</span>
              </h3>
              <p className="text-xs text-slate-400">
                Diligencia la fecha y el motivo. Tu solicitud quedará en estado "Pendiente" hasta confirmación del profesional.
              </p>
            </div>

            <form onSubmit={handleAgendarAprendiz} className="flex flex-col gap-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Seleccionar Profesional:
                  </label>
                  <select
                    value={psicologoSeleccionadoId}
                    onChange={(e) => setPsicologoSeleccionadoId(Number(e.target.value))}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white font-normal"
                  >
                    {psicologosDisponibles.map((p) => (
                      <option key={p.id_usuario} value={p.id_usuario}>
                        {p.nombre_usuario} - {p.especialidad}
                      </option>
                    ))}
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
                    onChange={(e) => setFechaSeleccionada(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full text-xs p-2 rounded-xl border border-slate-200 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Franja horaria preferida:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                  {['08:30', '10:00', '11:30', '14:00', '15:30', '16:30'].map((hora) => (
                    <button
                      key={hora}
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
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Motivo de la consulta (Confidencial):
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
                  <span>{agendando ? 'Enviando...' : 'Solicitar Cita'}</span>
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
              Historial de Citas y Sesiones Registradas
            </h3>
            <p className="text-xs text-slate-400">
              Registro auditado de estados: Pendiente, Confirmada, Realizada o Cancelada (RN-04)
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {misCitas.length} citas
          </span>
        </div>

        {misCitas.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No tienes citas agendadas en este momento.
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
                          : `Con: ${cita.psicologo?.nombre_usuario || 'Psicólogo Bienestar'}`}
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

                  {isPsicologo && cita.estado_cita === 'Pendiente' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          serenaApi.actualizarEstadoCita(
                            cita.id_cita,
                            'Confirmada',
                            'Confirmado por el psicólogo.'
                          );
                          onRefreshCitas();
                        }}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                      >
                        Confirmar
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
