import React, { useState } from 'react';
import { X, Layers, Plus, Check } from 'lucide-react';
import { Comunidad } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface CrearCustomFeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  comunidades: Comunidad[];
  onFeedCreated: () => void;
  idioma?: 'es' | 'en';
}

export const CrearCustomFeedModal: React.FC<CrearCustomFeedModalProps> = ({
  isOpen,
  onClose,
  comunidades = [],
  onFeedCreated,
  idioma = 'es',
}) => {
  const [nombre, setNombre] = useState('');
  const [seleccionadas, setSeleccionadas] = useState<string[]>(['s/CMTC']);

  if (!isOpen) return null;

  const handleToggle = (comId: string) => {
    setSeleccionadas((prev) =>
      prev.includes(comId) ? prev.filter((id) => id !== comId) : [...prev, comId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    serenaApi.crearCustomFeed(nombre.trim(), seleccionadas);
    setNombre('');
    onFeedCreated();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#EBADFF] text-purple-900 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4 text-purple-900" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {idioma === 'es' ? 'Crear Custom Feed' : 'Create Custom Feed'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {idioma === 'es' ? 'Agrupa comunidades y temas de tu interés' : 'Group communities and topics of interest'}
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

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {idioma === 'es' ? 'Nombre del Custom Feed:' : 'Custom Feed Name:'}
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder={idioma === 'es' ? 'Ej: Mis favoritos, Técnicas de Estudio' : 'E.g., My Favorites, Study Tips'}
              className="w-full text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#63C976] focus:outline-none focus:ring-2 focus:ring-[#63C976]/20 transition-all placeholder:text-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              {idioma === 'es' ? 'Selecciona las comunidades a incluir:' : 'Select communities to include:'}
            </label>
            <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
              {comunidades.map((c) => {
                const isChecked = seleccionadas.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleToggle(c.id)}
                    className={`text-left p-2.5 rounded-xl border text-xs flex items-center justify-between transition-all cursor-pointer ${
                      isChecked
                        ? 'border-[#63C976] bg-[#ECF9EE] text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold">{c.id}</p>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{c.sub_nombre}</p>
                    </div>
                    {isChecked && (
                      <div className="w-5 h-5 rounded-full bg-[#63C976] text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {idioma === 'es' ? 'Cancelar' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!nombre.trim()}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#63C976] hover:bg-[#47A95B] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {idioma === 'es' ? 'Crear Feed' : 'Create Feed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
