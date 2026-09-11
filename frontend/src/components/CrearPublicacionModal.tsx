import React, { useState } from 'react';
import { X, PlusCircle, Send, Sparkles } from 'lucide-react';
import { Usuario, Comunidad } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface CrearPublicacionModalProps {
  currentUser: Usuario;
  comunidades: Comunidad[];
  defaultComunidadId?: string;
  isOpen: boolean;
  onClose: () => void;
  onPublicacionCreada: () => void;
}

export const CrearPublicacionModal: React.FC<CrearPublicacionModalProps> = ({
  currentUser,
  comunidades,
  defaultComunidadId,
  isOpen,
  onClose,
  onPublicacionCreada,
}) => {
  const [comunidadId, setComunidadId] = useState<string>(defaultComunidadId || 's/CMTC');
  const [titulo, setTitulo] = useState<string>('');
  const [contenido, setContenido] = useState<string>('');
  const [etiqueta, setEtiqueta] = useState<string>('Bienestar Emocional');
  const [guardando, setGuardando] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    setGuardando(true);
    serenaApi.crearPublicacion(
      titulo,
      contenido,
      currentUser.id_usuario,
      comunidadId,
      etiqueta
    );

    setTimeout(() => {
      setGuardando(false);
      setTitulo('');
      setContenido('');
      onPublicacionCreada();
      onClose();
      alert('¡Publicación creada exitosamente en la comunidad!');
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-emerald-600" />
              <span>Nueva Publicación para Aprendices</span>
            </h3>
            <p className="text-xs text-slate-500">
              Solo funcionarios y psicólogos pueden publicar en el feed (RF-PUB-01)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Comunidad de Destino:
            </label>
            <select
              value={comunidadId}
              onChange={(e) => setComunidadId(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-emerald-900"
            >
              {comunidades.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} - {c.sub_nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Título del Artículo o Comunicado:
            </label>
            <input
              type="text"
              required
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej: Técnicas de manejo de estrés en sustentaciones finales..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Etiqueta temática:
            </label>
            <select
              value={etiqueta}
              onChange={(e) => setEtiqueta(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50"
            >
              <option value="Bienestar Emocional">Bienestar Emocional</option>
              <option value="Autocuidado">Autocuidado</option>
              <option value="Prevención">Prevención del Burnout</option>
              <option value="Economía">Finanzas y Apoyos</option>
              <option value="Convivencia">Convivencia y Respeto</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contenido de la Publicación:
            </label>
            <textarea
              rows={5}
              required
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Redacta la información, consejos, fechas de talleres o pautas de acompañamiento..."
              className="w-full text-xs p-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-emerald-500 leading-relaxed"
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
              disabled={guardando}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{guardando ? 'Publicando...' : 'Publicar en la Comunidad'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
