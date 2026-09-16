import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2, BarChart2 } from 'lucide-react';
import { Usuario } from '../types/serena.types';

interface CrearReporteModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: Usuario;
  idioma?: 'es' | 'en';
}

export const CrearReporteModal: React.FC<CrearReporteModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  idioma = 'es',
}) => {
  const [tipoReporte, setTipoReporte] = useState('citas');
  const [rangoFechas, setRangoFechas] = useState('mes');
  const [generado, setGenerado] = useState(false);

  if (!isOpen) return null;

  const handleGenerar = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerado(true);
    setTimeout(() => {
      alert(
        idioma === 'es'
          ? `Reporte de ${tipoReporte} exportado exitosamente conforme a los lineamientos del SENA CMTC.`
          : `Report of ${tipoReporte} successfully generated and exported.`
      );
      setGenerado(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-purple-50 to-emerald-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#63C976] text-white flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                {idioma === 'es' ? 'Crear Reporte Institucional' : 'Create Institutional Report'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {idioma === 'es' ? 'Trazabilidad y métricas de Bienestar al Aprendiz' : 'Traceability & Wellness Metrics'}
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

        <form onSubmit={handleGenerar} className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {idioma === 'es' ? 'Tipo de Reporte a Generar:' : 'Report Type:'}
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-[#63C976] focus:outline-none"
            >
              <option value="citas">
                {idioma === 'es' ? 'Citas y Atenciones Psicológicas (Historial Inmutable)' : 'Appointments & Counseling (Immutable Logs)'}
              </option>
              <option value="tamizajes">
                {idioma === 'es' ? 'Resultados de Tamizajes y Encuestas' : 'Screening Surveys & Form Results'}
              </option>
              <option value="animo">
                {idioma === 'es' ? 'Evolución de Estados de Ánimo del Centro CMTC' : 'Mood Evolution Trends for CMTC'}
              </option>
              <option value="emergencias">
                {idioma === 'es' ? 'Atención de Emergencias y Activaciones de Pánico' : 'Emergency Activations & Panic Logs'}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {idioma === 'es' ? 'Rango de fechas:' : 'Date Range:'}
            </label>
            <select
              value={rangoFechas}
              onChange={(e) => setRangoFechas(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:border-[#63C976] focus:outline-none"
            >
              <option value="semana">{idioma === 'es' ? 'Últimos 7 días' : 'Last 7 days'}</option>
              <option value="mes">{idioma === 'es' ? 'Último mes lectivo' : 'Last month'}</option>
              <option value="trimestre">{idioma === 'es' ? 'Trimestre actual SENA' : 'Current quarter'}</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <BarChart2 className="w-4 h-4 text-[#63C976] shrink-0 mt-0.5" />
            <span>
              {idioma === 'es'
                ? 'El archivo se exporta en formato consolidado CSV/Excel respetando la Ley 1581 de 2012 de protección de datos personales de aprendices.'
                : 'Consolidated report conforming to Colombian privacy regulations (Law 1581).'}
            </span>
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
              disabled={generado}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#63C976] hover:bg-[#47A95B] transition-all disabled:opacity-50 cursor-pointer shadow-sm flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{generado ? (idioma === 'es' ? 'Generando...' : 'Generating...') : (idioma === 'es' ? 'Exportar Reporte' : 'Export Report')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
