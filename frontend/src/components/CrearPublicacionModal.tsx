import React, { useState } from 'react';
import { X, PlusCircle, Send, ImagePlus } from 'lucide-react';
import { Usuario, Comunidad, Publicacion } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface CrearPublicacionModalProps {
  currentUser: Usuario;
  comunidades: Comunidad[];
  defaultComunidadId?: string;
  isOpen: boolean;
  onClose: () => void;
  onPublicacionCreada: (publicacion: Publicacion) => Promise<void> | void;
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
  const [imagenUrl, setImagenUrl] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo.trim() || !contenido.trim()) return;

    setGuardando(true);
    try {
      const publicacion = await serenaApi.crearPublicacionEnApi({
        titulo,
        contenido,
        id_usuario: currentUser.id_usuario,
        id_comunidad: comunidadId,
        etiqueta,
        imagen_url: imagenUrl || undefined,
      });
      setTitulo('');
      setContenido('');
      setImagenUrl('');
      await onPublicacionCreada(publicacion);
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setGuardando(false);
    }
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
              Solo funcionarios y psicólogos pueden publicar en el feed
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Imagen adjunta (opcional):
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-600 hover:border-violet-400 hover:bg-violet-50">
              <ImagePlus className="h-4 w-4 text-violet-600" />
              <span>{imagenUrl ? 'Imagen seleccionada' : 'Seleccionar imagen'}</span>
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setImagenUrl(typeof reader.result === 'string' ? reader.result : '');
                  const image = new Image();
                  image.onload = () => {
                    const maxDimension = 1280;
                    const scale = Math.min(1, maxDimension / Math.max(image.width, image.height));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.max(1, Math.round(image.width * scale));
                    canvas.height = Math.max(1, Math.round(image.height * scale));
                    const context = canvas.getContext('2d');
                    if (!context) {
                      reader.readAsDataURL(file);
                      return;
                    }
                    context.drawImage(image, 0, 0, canvas.width, canvas.height);
                    setImagenUrl(canvas.toDataURL('image/jpeg', 0.78));
                  };
                  image.onerror = () => reader.readAsDataURL(file);
                  image.src = URL.createObjectURL(file);
                }}
              />
            </label>
            {imagenUrl && <img src={imagenUrl} alt="Vista previa" className="mt-2 max-h-40 w-full rounded-xl object-cover" />}
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
