import React from 'react';
import { X, Construction, ExternalLink, Sparkles, BookOpen, HelpCircle, Info } from 'lucide-react';

interface SitioEnConstruccionModalProps {
  isOpen: boolean;
  onClose: () => void;
  tipo: 'about' | 'blog' | 'help';
  idioma?: 'es' | 'en';
}

export const SitioEnConstruccionModal: React.FC<SitioEnConstruccionModalProps> = ({
  isOpen,
  onClose,
  tipo,
  idioma = 'es',
}) => {
  if (!isOpen) return null;

  const contentMap = {
    about: {
      titulo: idioma === 'es' ? 'Acerca de SERENA' : 'About SERENA',
      subtitulo: idioma === 'es' ? 'Tu compañera Digital para el bienestar emocional' : 'Your Digital Companion for Emotional Wellbeing',
      descripcion:
        idioma === 'es'
          ? 'SERENA es una plataforma integral desarrollada para la comunidad del SENA (Regional Distrito Capital - Centro de Manufactura en Textiles y Cuero, Ficha ADSO 3288046). Nuestro objetivo es brindar un espacio accesible, confidencial y empático para el seguimiento de la salud mental.'
          : 'SERENA is an integral digital platform developed for the SENA community (CMTC, ADSO 3288046). Our mission is providing a confidential, empathetic space for mental wellness.',
      icon: <Info className="w-6 h-6 text-purple-600" />,
      externalUrl: 'https://www.sena.edu.co',
      tag: 'SENA CMTC 2026',
    },
    blog: {
      titulo: idioma === 'es' ? 'Blog de Bienestar & Salud Mental' : 'Wellbeing & Mental Health Blog',
      subtitulo: idioma === 'es' ? 'Artículos, pautas y reflexiones para la comunidad SENA' : 'Articles, tips and reflections for the SENA community',
      descripcion:
        idioma === 'es'
          ? 'Este módulo editorial se encuentra actualmente en fase de redacción y revisión por el equipo psicosocial de Bienestar al Aprendiz. Pronto encontrarás artículos sobre técnicas de estudio, regulación del estrés y autocuidado.'
          : 'This editorial module is currently under drafting by the psychosocial team. Soon you will find articles on stress regulation and study tips.',
      icon: <BookOpen className="w-6 h-6 text-[#63C976]" />,
      externalUrl: 'https://bienestar.sena.edu.co',
      tag: 'Blog CMTC',
    },
    help: {
      titulo: idioma === 'es' ? 'Centro de Ayuda y Preguntas Frecuentes' : 'Help Center & FAQ',
      subtitulo: idioma === 'es' ? 'Canales de atención y soporte técnico' : 'Support channels and tech guidance',
      descripcion:
        idioma === 'es'
          ? 'El portal de soporte y documentación de SERENA está en construcción. Si requieres asistencia psicológica presencial, acércate a la oficina de Bienestar al Aprendiz en la sede Restrepo o escribe a bienestar.cmtc@sena.edu.co.'
          : 'SERENA documentation and support portal is under construction. If you need immediate counselor support, visit the CMTC Wellness office.',
      icon: <HelpCircle className="w-6 h-6 text-purple-600" />,
      externalUrl: 'mailto:bienestar.cmtc@sena.edu.co',
      tag: 'Soporte 24/7',
    },
  };

  const item = contentMap[tipo];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-6 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-100 to-emerald-100 border border-purple-200/60 flex items-center justify-center mb-4">
            {item.icon}
          </div>

          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Construction className="w-3 h-3" />
            {idioma === 'es' ? 'Sitio en Construcción' : 'Under Construction'}
          </span>

          <h3 className="font-extrabold text-lg text-slate-900">{item.titulo}</h3>
          <p className="text-xs text-purple-600 font-semibold mb-3">{item.subtitulo}</p>

          <p className="text-xs text-slate-600 leading-relaxed mb-6 px-2 text-justify">
            {item.descripcion}
          </p>

          <div className="w-full flex items-center justify-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {idioma === 'es' ? 'Cerrar' : 'Close'}
            </button>

            <a
              href={item.externalUrl}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#63C976] hover:bg-[#47A95B] transition-colors flex items-center gap-1.5 shadow-sm shadow-[#63C976]/30"
            >
              <span>{idioma === 'es' ? 'Ir al sitio externo' : 'Visit external site'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
