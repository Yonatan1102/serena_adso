import React, { useState } from 'react';
import { X, PlusCircle, Compass, ShieldCheck } from 'lucide-react';
import { Usuario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface CrearSubComunidadModalProps {
  currentUser: Usuario;
  isOpen: boolean;
  onClose: () => void;
  onComunidadCreada: (nuevaComunidadId: string) => void;
}

export const CrearSubComunidadModal: React.FC<CrearSubComunidadModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onComunidadCreada,
}) => {
  const [subNombre, setSubNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [creando, setCreando] = useState(false);

  if (!isOpen) return null;

  const slugGenerado = subNombre.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
  const idEsperado = `s/${currentUser.centro}/${slugGenerado || 'nombre'}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subNombre.trim() || !descripcion.trim()) return;

    setCreando(true);
    const nueva = serenaApi.crearSubComunidad(subNombre, descripcion, currentUser);

    setTimeout(() => {
      setCreando(false);
      setSubNombre('');
      setDescripcion('');
      onComunidadCreada(nueva.id);
      onClose();
      alert(`¡Comunidad "${nueva.id}" creada con éxito por ${currentUser.nombre_usuario}!`);
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-600" />
              <span>Crear Nueva Subcomunidad</span>
            </h3>
            <p className="text-xs text-slate-500">
              Ligada permanentemente a tu centro: <strong>{currentUser.centro}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 mb-4 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Solo los funcionarios pueden fundar comunidades y publicar en ellas.
          </span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombre de la Subcomunidad (Tema / Ficha / Área):
            </label>
            <input
              type="text"
              required
              value={subNombre}
              onChange={(e) => setSubNombre(e.target.value)}
              placeholder="Ej: economia, salud-mental, deportes..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-semibold"
            />
            <p className="text-[11px] text-slate-500 mt-1 font-mono">
              Identificador generado: <strong className="text-emerald-700">{idEsperado}</strong>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Propósito y Descripción:
            </label>
            <textarea
              rows={3}
              required
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="¿Qué temas abordará esta comunidad y cómo beneficia a los aprendices?"
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creando}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{creando ? 'Creando...' : 'Fundar Subcomunidad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
