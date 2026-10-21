import React, { useState } from 'react';
import { X, FileSpreadsheet, Download, CheckCircle2, BarChart2 } from 'lucide-react';
import { Usuario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

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
  const [rangoFechas, setRangoFechas] = useState('mes');
  const [generado, setGenerado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerar = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerado(true);
    setMensaje(null);
    setError(null);
    try {
      const hasta = new Date();
      const dias = rangoFechas === 'semana' ? 7 : rangoFechas === 'trimestre' ? 90 : 30;
      const desde = new Date(hasta.getTime() - dias * 24 * 60 * 60 * 1000);
      const rows = await serenaApi.getReporteOrientacionesDesdeApi(desde, hasta);
      const columns = ['Fecha', 'Aprendiz', 'Estado', 'Motivo', 'Motivo de cambio'];
      const csvCell = (value: unknown) => {
        const text = String(value ?? '').replace(/[\r\n]+/g, ' ').replace(/^([=+\-@])/, "'$1");
        return `"${text.replace(/"/g, '""')}"`;
      };
      const csv = [
        columns.map(csvCell).join(';'),
        ...rows.map((row) => [
          new Date(row.fecha_hora).toLocaleString('es-CO'),
          row.aprendiz,
          row.estado,
          row.motivo,
          row.motivo_cambio,
        ].map(csvCell).join(';')),
      ].join('\r\n');
      const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `serena-orientaciones-${desde.toISOString().slice(0, 10)}-${hasta.toISOString().slice(0, 10)}.csv`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMensaje(idioma === 'es'
        ? `Reporte descargado con ${rows.length} orientaciones.`
        : `Report downloaded with ${rows.length} orientations.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No fue posible generar el reporte.');
    } finally {
      setGenerado(false);
    }
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
                {idioma === 'es' ? 'Métricas de Bienestar al Aprendiz' : 'Wellness Metrics'}
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
          {mensaje && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{mensaje}</p>}
          {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {idioma === 'es' ? 'Tipo de Reporte a Generar:' : 'Report Type:'}
            </label>
            <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              {idioma === 'es' ? 'Orientaciones psicosociales registradas para tu cuenta.' : 'Psychosocial orientations recorded for your account.'}
            </p>
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
              <option value="mes">{idioma === 'es' ? 'Últimos 30 días' : 'Last 30 days'}</option>
              <option value="trimestre">{idioma === 'es' ? 'Últimos 90 días' : 'Last 90 days'}</option>
            </select>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <BarChart2 className="w-4 h-4 text-[#63C976] shrink-0 mt-0.5" />
            <span>
              {idioma === 'es'
                ? 'Se descargará un CSV que puedes abrir en Excel. Incluye solo las orientaciones visibles para tu cuenta.'
                : 'A CSV will be downloaded with the orientations visible to your account.'}
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
