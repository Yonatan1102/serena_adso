import React, { useEffect, useState } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  CheckCircle2,
  Heart,
  AlertTriangle,
  Clock,
  X,
  Send,
} from 'lucide-react';
import { Usuario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface EmergenciaModalProps {
  currentUser: Usuario;
  isOpen: boolean;
  onClose: () => void;
}

export const EmergenciaModal: React.FC<EmergenciaModalProps> = ({
  currentUser,
  isOpen,
  onClose,
}) => {
  const [notificado, setNotificado] = useState(false);
  const [detalle, setDetalle] = useState('');

  useEffect(() => {
    if (isOpen) {
      // RF-EM-01 y RN-05: Se registra automáticamente en la tabla de emergencias como evidencia inmutable
      serenaApi.registrarEmergencia(
        currentUser.id_usuario,
        'Activación de auxilio inmediato desde el botón de pánico en la plataforma.'
      );
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const handleNotificarPsicologo = (e: React.FormEvent) => {
    e.preventDefault();
    setNotificado(true);
    serenaApi.registrarEmergencia(
      currentUser.id_usuario,
      `Detalle adicional del aprendiz: ${detalle || 'Solicita contacto telefónico urgente.'}`
    );
    setTimeout(() => {
      alert('Tu psicólogo asignado y el equipo de Bienestar al Aprendiz han sido alertados.');
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-rose-200 animate-in zoom-in-95 duration-150 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ícono de Alerta y Título */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-lg shadow-rose-600/30">
            <ShieldAlert className="w-7 h-7 animate-pulse" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              Protocolo Institucional SENA • RF-EM-01
            </span>
            <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
              Activación de Auxilio & Emergencia
            </h3>
          </div>
        </div>

        {/* Mensaje de Apoyo Empático */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-xs text-rose-950 leading-relaxed mb-5">
          <p className="font-bold mb-1 flex items-center gap-1.5 text-rose-900">
            <Heart className="w-4 h-4 fill-rose-600 text-rose-600 shrink-0" />
            No estás solo(a). Tu bienestar es lo más importante.
          </p>
          <p>
            Hemos registrado la alerta en nuestro sistema de auditoría <strong>(RN-05)</strong>. A continuación tienes acceso directo a las líneas de atención psicológica gratuitas 24/7 y al equipo de Bienestar del Centro CMTC.
          </p>
        </div>

        {/* Botones de Marcado Telefónico Nativo (Disparo directo HTML 'tel:') */}
        <div className="flex flex-col gap-2.5 mb-6">
          <a
            href="tel:106"
            className="w-full py-3 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-extrabold text-xs shadow-md shadow-rose-600/20 flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-black text-sm">Llamar a Línea 106 (Línea de la Vida)</p>
                <p className="text-[11px] text-rose-100 font-normal">
                  Atención psicológica gratuita y confidencial 24/7
                </p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2.5 py-1 rounded-xl">Marcar 106</span>
          </a>

          <a
            href="tel:123"
            className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-xs shadow-sm flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-4 h-4 text-slate-300" />
              <div className="text-left">
                <p className="font-bold">Línea de Emergencias 123 (Nacional)</p>
                <p className="text-[10px] text-slate-400">Atención inmediata de urgencias</p>
              </div>
            </div>
            <span className="text-xs bg-white/10 px-2 py-0.5 rounded-lg">Marcar 123</span>
          </a>

          <a
            href="tel:+573108765432"
            className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-2xl font-bold text-xs shadow-sm flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <PhoneCall className="w-4 h-4 text-emerald-200" />
              <div className="text-left">
                <p className="font-bold">Consultorio Bienestar CMTC</p>
                <p className="text-[10px] text-emerald-200">Dra. Laura Martínez • Psicóloga</p>
              </div>
            </div>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-lg">Llamar CMTC</span>
          </a>
        </div>

        {/* Notificar por escrito a Psicólogo */}
        <div className="border-t border-slate-100 pt-4">
          <p className="text-xs font-bold text-slate-800 mb-2">
            ¿Deseas enviar un mensaje directo a tu psicólogo asignado?
          </p>
          {notificado ? (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mensaje enviado con prioridad al consultorio. Se pondrán en contacto contigo.</span>
            </div>
          ) : (
            <form onSubmit={handleNotificarPsicologo} className="flex gap-2">
              <input
                type="text"
                value={detalle}
                onChange={(e) => setDetalle(e.target.value)}
                placeholder="Indica brevemente dónde estás o cómo te sientes..."
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-rose-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shrink-0 transition-colors flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar</span>
              </button>
            </form>
          )}
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
          <span>Registro inmutable de auditoría creado.</span>
          <button
            onClick={onClose}
            className="text-slate-600 hover:text-slate-900 font-bold hover:underline"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
