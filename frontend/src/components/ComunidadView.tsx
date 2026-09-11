import React, { useState } from 'react';
import {
  Users,
  ShieldCheck,
  Calendar,
  Clock,
  Mail,
  Phone,
  PlusCircle,
  FileText,
  Sparkles,
  ArrowBigUp,
  ArrowBigDown,
  MessageSquare,
  Share2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Comunidad, Usuario, Publicacion } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface ComunidadViewProps {
  comunidad: Comunidad;
  currentUser: Usuario;
  publicaciones: Publicacion[];
  onVote: (id_pub: number, delta: number) => void;
  onOpenCreatePublicacion: () => void;
  onOpenAgendarConPsicologo: (psicologo: Usuario) => void;
  onOpenCreateSubComunidad: () => void;
}

export const ComunidadView: React.FC<ComunidadViewProps> = ({
  comunidad,
  currentUser,
  publicaciones = [],
  onVote,
  onOpenCreatePublicacion,
  onOpenAgendarConPsicologo,
  onOpenCreateSubComunidad,
}) => {
  const isFuncionario = currentUser.id_rol === 2 || currentUser.id_rol === 3;
  const comunidadId = comunidad?.id || 's/CMTC';
  const integrantesFuncionarios = serenaApi.getIntegrantesComunidad(comunidadId);
  const [funcionarioPerfilModal, setFuncionarioPerfilModal] = useState<Usuario | null>(null);

  // Filtrar publicaciones específicas de esta comunidad
  const publicacionesComunidad = (publicaciones || []).filter((p) => p.id_comunidad === comunidadId);

  // Publicaciones del funcionario seleccionado en el modal
  const publicacionesFuncionario = funcionarioPerfilModal
    ? (publicaciones || []).filter((p) => p.id_usuario === funcionarioPerfilModal.id_usuario)
    : [];

  return (
    <div className="flex-1 flex flex-col gap-4 max-w-5xl mx-auto pb-12">
      {/* Banner de Cabecera de la Comunidad */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87] font-semibold text-xs uppercase tracking-wider">
              {comunidad.id}
            </span>
            <span className="text-xs text-slate-500">
              Centro: <strong className="text-slate-800 font-semibold">{comunidad.centro}</strong>
            </span>
            {comunidad.es_oficial && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EBF7E6] text-[#2E8500]">
                Comunidad Oficial SENA
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {comunidad.nombre_completo}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
            {comunidad.descripcion}
          </p>

          <div className="mt-4 flex items-center gap-2.5 flex-wrap">
            {/* Solo funcionarios pueden crear subcomunidad o publicar */}
            {isFuncionario && (
              <>
                <button
                  onClick={onOpenCreatePublicacion}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Crear Publicación en {comunidad.id}</span>
                </button>
                <button
                  onClick={onOpenCreateSubComunidad}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Nueva Subcomunidad ({comunidad.centro})</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: INTEGRANTES */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#7E22CE]" />
              <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                Integrantes y Equipo de Bienestar ({comunidad.centro})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Profesionales y psicólogos adscritos disponibles para acompañamiento institucional
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-lg">
            {integrantesFuncionarios.length} Funcionarios
          </span>
        </div>

        {/* Tarjetas de Funcionarios */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {integrantesFuncionarios.map((funcionario) => (
            <div
              key={funcionario.id_usuario}
              className="p-3.5 rounded-xl border border-slate-100 bg-white/60 hover:bg-white transition-all flex flex-col justify-between gap-3"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-sm shrink-0">
                  {funcionario.nombre_usuario.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs sm:text-sm text-slate-900">
                      {funcionario.nombre_usuario}
                    </p>
                    <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                      Psicólogo(a)
                    </span>
                  </div>
                  <p className="text-xs text-[#7E22CE] font-medium mt-0.5">
                    {funcionario.especialidad || 'Bienestar Integral'}
                  </p>

                  <div className="flex flex-col gap-0.5 text-[11px] text-slate-400 mt-1.5">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {funcionario.horario_atencion || 'Lun-Vie 8:00 AM - 1:00 PM'}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      {funcionario.email}
                    </span>
                  </div>
                </div>
              </div>

              {/* Acciones de la Tarjeta del Funcionario */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setFuncionarioPerfilModal(funcionario)}
                  className="flex-1 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span>Ver Publicaciones</span>
                </button>

                {currentUser.id_rol === 1 && (
                  <button
                    onClick={() => onOpenAgendarConPsicologo(funcionario)}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Agendar Cita</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 2: AL BAJAR -> PUBLICACIONES QUE CONCIERNEN A DICHA COMUNIDAD */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Publicaciones en {comunidad.id}
            </h3>
            <p className="text-xs text-slate-400">
              Cápsulas y avisos redactados exclusivamente por los funcionarios para este espacio
            </p>
          </div>
          <span className="text-xs font-normal text-slate-400">
            {publicacionesComunidad.length} publicaciones
          </span>
        </div>

        {publicacionesComunidad.length === 0 ? (
          <div className="rounded-2xl p-8 text-center text-xs text-slate-400">
            No hay publicaciones aún en <strong>{comunidad.id}</strong>.
            {isFuncionario && (
              <div className="mt-2">
                <button
                  onClick={onOpenCreatePublicacion}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  Crear la primera publicación
                </button>
              </div>
            )}
          </div>
        ) : (
          publicacionesComunidad.map((pub) => (
            <article
              key={pub.id_publicaciones}
              className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs">
                    {pub.autor?.nombre_usuario.charAt(0) || 'P'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-slate-900">
                        {pub.autor?.nombre_usuario || 'Funcionario Bienestar'}
                      </span>
                      <span className="text-[10px] font-medium px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                        Funcionario
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {new Date(pub.fecha_publicacion).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {pub.etiqueta && (
                  <span className="text-[10px] font-medium px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full">
                    {pub.etiqueta}
                  </span>
                )}
              </div>

              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 mb-1">{pub.titulo}</h4>
                <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                  {pub.contenido}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-normal">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg px-2 py-0.5">
                    <button
                      onClick={() => onVote(pub.id_publicaciones, 1)}
                      className="hover:text-slate-800 cursor-pointer"
                    >
                      <ArrowBigUp className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-semibold text-slate-700">
                      {pub.votos || 0}
                    </span>
                    <button
                      onClick={() => onVote(pub.id_publicaciones, -1)}
                      className="hover:text-slate-800 cursor-pointer"
                    >
                      <ArrowBigDown className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="flex items-center gap-1 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{pub.comentarios_count || 0} comentarios</span>
                  </span>
                </div>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Modal: Perfil del Funcionario y su Actividad en Publicaciones (Regla del Usuario) */}
      {funcionarioPerfilModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            {/* Header del Perfil */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-base shadow-sm">
                  {funcionarioPerfilModal.nombre_usuario.charAt(0)}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    {funcionarioPerfilModal.nombre_usuario}
                    <span className="text-[10px] font-bold px-1.5 py-0.5 bg-teal-100 text-teal-800 rounded">
                      Psicólogo(a)
                    </span>
                  </h3>
                  <p className="text-xs text-emerald-700 font-semibold">
                    {funcionarioPerfilModal.especialidad}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setFuncionarioPerfilModal(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Datos de Contacto y Atención */}
            <div className="py-3 bg-slate-50 rounded-2xl p-3 my-3 border border-slate-100 text-xs text-slate-600 flex flex-col gap-1.5">
              <p>
                <strong>Centro:</strong> {funcionarioPerfilModal.centro} (Manufactura en Textiles y Cuero)
              </p>
              <p>
                <strong>Horario de atención:</strong> {funcionarioPerfilModal.horario_atencion}
              </p>
              <p>
                <strong>Contacto institucional:</strong> {funcionarioPerfilModal.email}
              </p>
            </div>

            {/* Actividad en Publicaciones de este Funcionario */}
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Actividad y Publicaciones Realizadas:
            </h4>

            <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
              {publicacionesFuncionario.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  Este profesional aún no ha publicado artículos en SERENA.
                </p>
              ) : (
                publicacionesFuncionario.map((p) => (
                  <div
                    key={p.id_publicaciones}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                      <span className="font-bold text-emerald-800">{p.id_comunidad}</span>
                      <span>{new Date(p.fecha_publicacion).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-xs font-bold text-slate-900 mb-1">{p.titulo}</h5>
                    <p className="text-xs text-slate-600 line-clamp-2">{p.contenido}</p>
                  </div>
                ))
              )}
            </div>

            {/* Botón de Cierre */}
            <div className="pt-4 border-t border-slate-100 flex justify-end gap-2">
              <button
                onClick={() => setFuncionarioPerfilModal(null)}
                className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
