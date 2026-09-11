import React, { useState } from 'react';
import { X, Lock, ShieldCheck, BookOpen } from 'lucide-react';
import { Usuario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface CrearDiarioRapidoModalProps {
  currentUser: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
  idioma?: 'es' | 'en';
}

export const CrearDiarioRapidoModal: React.FC<CrearDiarioRapidoModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onSaved,
  idioma = 'es',
}) => {
  const [titulo, setTitulo] = useState('');
  const [contenido, setContenido] = useState('');
  const [compartirSp, setCompartirSp] = useState(false);
  const [guardando, setGuardando] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contenido.trim()) return;

    setGuardando(true);
    serenaApi.guardarEntradaDiario(
      currentUser.id_usuario,
      titulo.trim() || (idioma === 'es' ? 'Reflexión diaria' : 'Daily Reflection'),
      contenido.trim(),
      compartirSp ? 1 : 0
    );

    setTimeout(() => {
      setGuardando(false);
      setTitulo('');
      setContenido('');
      setCompartirSp(false);
      if (onSaved) onSaved();
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50/60 to-emerald-50/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBADFF] text-purple-900 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5 text-purple-900" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900">
                {idioma === 'es' ? 'Nuevo Diario Rápido' : 'New Quick Journal'}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3 text-indigo-500" />
                {idioma === 'es' ? 'Cifrado en reposo simulado (AES-256)' : 'Encrypted storage simulated (AES-256)'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {idioma === 'es' ? 'Título (opcional):' : 'Title (optional):'}
            </label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={idioma === 'es' ? '¿Sobre qué quieres reflexionar hoy?' : 'What do you want to reflect on today?'}
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#63C976] focus:outline-none focus:ring-2 focus:ring-[#63C976]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {idioma === 'es' ? 'Tus pensamientos y desahogo personal:' : 'Your thoughts and personal notes:'}
            </label>
            <textarea
              required
              rows={5}
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder={
                idioma === 'es'
                  ? 'Escribe libremente. Este espacio es seguro, privado y te ayuda a regular tus emociones...'
                  : 'Write freely. This space is safe, private and helps you regulate your emotions...'
              }
              className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#63C976] focus:outline-none focus:ring-2 focus:ring-[#63C976]/20 transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Opción para compartir con psicólogo */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
            <input
              type="checkbox"
              id="compartir_sp_check"
              checked={compartirSp}
              onChange={(e) => setCompartirSp(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-[#63C976] focus:ring-[#63C976] h-4 w-4 cursor-pointer"
            />
            <label htmlFor="compartir_sp_check" className="text-xs text-slate-700 cursor-pointer">
              <span className="font-bold text-slate-900 block">
                {idioma === 'es' ? 'Compartir con mi psicólogo asignado' : 'Share with assigned counselor'}
              </span>
              <span className="text-slate-500">
                {idioma === 'es'
                  ? 'Si lo desmarcas, solo tú podrás leer esta entrada. Cumple con la regla RN-02 de privacidad.'
                  : 'If unchecked, only you can read this entry. Enforces RN-02 privacy rule.'}
              </span>
            </label>
          </div>

          {/* Footer botones */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              {idioma === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={guardando || !contenido.trim()}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#63C976] hover:bg-[#47A95B] active:scale-98 transition-all shadow-sm shadow-[#63C976]/30 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>
                {guardando
                  ? (idioma === 'es' ? 'Cifrando y Guardando...' : 'Encrypting & Saving...')
                  : (idioma === 'es' ? 'Guardar en mi Diario' : 'Save to Journal')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
