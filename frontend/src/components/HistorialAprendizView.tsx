import { FormEvent, useEffect, useRef, useState } from 'react';
import { AlertCircle, Download, FileText, HeartPulse, Plus, Upload } from 'lucide-react';
import { ClinicalSummary, ClinicalSupportFile, Usuario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface HistorialAprendizViewProps {
  currentUser: Usuario;
}

const maxPdfSize = 10 * 1024 * 1024;

export function HistorialAprendizView({ currentUser }: HistorialAprendizViewProps) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [summary, setSummary] = useState<ClinicalSummary>({ condiciones: [], fecha_apertura: null });
  const [supports, setSupports] = useState<ClinicalSupportFile[]>([]);
  const [condition, setCondition] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const reload = async () => {
    setLoading(true);
    try {
      const [record, documents] = await Promise.all([
        serenaApi.getMiResumenClinicoDesdeApi(),
        serenaApi.getSoportesClinicosDesdeApi(currentUser.id_usuario),
      ]);
      setSummary(record);
      setSupports(documents);
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo cargar tu historial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void reload(); }, [currentUser.id_usuario]);

  const addCondition = async (event: FormEvent) => {
    event.preventDefault();
    const cleaned = condition.trim();
    if (!cleaned || summary.condiciones.some((item) => item.toLocaleLowerCase() === cleaned.toLocaleLowerCase())) return;
    setBusy(true);
    setError('');
    try {
      const updated = await serenaApi.guardarMiResumenClinicoEnApi([...summary.condiciones, cleaned]);
      setSummary(updated);
      setCondition('');
      setNotice('Condición guardada. Puedes adjuntar un PDF como soporte.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo guardar la condición.');
    } finally {
      setBusy(false);
    }
  };

  const removeCondition = async (conditionToRemove: string) => {
    setBusy(true);
    try {
      setSummary(await serenaApi.guardarMiResumenClinicoEnApi(
        summary.condiciones.filter((item) => item !== conditionToRemove),
      ));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo actualizar la lista.');
    } finally {
      setBusy(false);
    }
  };

  const upload = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) return;
    if (file.type !== 'application/pdf' || !file.name.toLocaleLowerCase().endsWith('.pdf')) {
      setError('Selecciona un archivo PDF.');
      return;
    }
    if (file.size > maxPdfSize) {
      setError('El PDF no puede superar los 10 MB.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const added = await serenaApi.subirSoporteClinicoEnApi(file, description.trim());
      setSupports((previous) => [added, ...previous]);
      setFile(null);
      setDescription('');
      if (fileInput.current) fileInput.current.value = '';
      setNotice('Documento PDF adjuntado a tu historial.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo subir el documento.');
    } finally {
      setBusy(false);
    }
  };

  const download = async (support: ClinicalSupportFile) => {
    try {
      const blob = await serenaApi.descargarSoporteClinicoDesdeApi(support.id_soporte);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = support.nombre_archivo;
      link.click();
      URL.revokeObjectURL(url);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo descargar el PDF.');
    }
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 pb-10">
      <header className="border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <HeartPulse className="h-6 w-6 text-violet-700" />
          <div>
            <h1 className="text-xl font-bold text-slate-900">Mi historial de salud</h1>
            <p className="mt-1 text-sm text-slate-600">Gestiona las condiciones que deseas registrar y adjunta documentos de soporte en PDF.</p>
          </div>
        </div>
      </header>

      {error && <p role="alert" className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800"><AlertCircle size={16} />{error}</p>}
      {notice && <p role="status" className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}
      {loading ? <p className="text-sm text-slate-500">Cargando historial…</p> : (
        <>
          <section className="space-y-4 border-b border-slate-200 pb-6">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Condiciones de salud</h2>
              <p className="mt-1 text-xs text-slate-500">Registra solo información que quieras incorporar a tu historial. El equipo psicosocial autorizado podrá consultarla.</p>
            </div>
            <form onSubmit={addCondition} className="flex flex-col gap-2 sm:flex-row">
              <input value={condition} onChange={(event) => setCondition(event.target.value)} maxLength={100} placeholder="Nombre de la condición" className="min-w-0 flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm" />
              <button type="submit" disabled={busy || !condition.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-800 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-50"><Plus size={16} />Agregar condición</button>
            </form>
            {summary.condiciones.length === 0 ? <p className="text-sm text-slate-500">No has registrado condiciones.</p> : (
              <ul className="divide-y divide-slate-100">
                {summary.condiciones.map((item) => <li key={item} className="flex items-center justify-between gap-3 py-2.5 text-sm"><span>{item}</span><button type="button" disabled={busy} onClick={() => void removeCondition(item)} className="text-xs font-medium text-rose-700 hover:underline disabled:opacity-50">Quitar</button></li>)}
              </ul>
            )}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Documentos de soporte</h2>
              <p className="mt-1 text-xs text-slate-500">Los PDF adjuntos se guardan en tu expediente. Tu psicosocial autorizado podrá visualizarlos y descargarlos.</p>
            </div>
            <form onSubmit={upload} className="grid gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <label className="text-xs font-medium text-slate-700">Archivo PDF
                <input ref={fileInput} type="file" accept="application/pdf,.pdf" onChange={(event) => setFile(event.target.files?.[0] ?? null)} required className="mt-1 block w-full text-xs file:mr-2 file:rounded-md file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:font-semibold file:text-violet-800" />
                <span className="mt-1 block text-[11px] text-slate-500">Máximo 10 MB</span>
              </label>
              <label className="text-xs font-medium text-slate-700">Descripción
                <input value={description} onChange={(event) => setDescription(event.target.value)} maxLength={500} placeholder="Opcional" className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm" />
              </label>
              <button type="submit" disabled={busy || !file} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-violet-800 px-4 text-sm font-semibold text-white hover:bg-violet-900 disabled:opacity-50"><Upload size={16} />Adjuntar</button>
            </form>
            {supports.length === 0 ? <p className="py-4 text-center text-sm text-slate-500">Todavía no hay documentos adjuntos.</p> : (
              <ul className="divide-y divide-slate-100">
                {supports.map((support) => <li key={support.id_soporte} className="flex flex-wrap items-center justify-between gap-3 py-3"><div className="flex min-w-0 items-start gap-3"><FileText className="mt-0.5 h-5 w-5 shrink-0 text-violet-700" /><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-900">{support.nombre_archivo}</p><p className="text-xs text-slate-500">{support.descripcion || 'PDF'} · {(support.tamano_bytes / 1024 / 1024).toFixed(2)} MB · {new Date(support.fecha_carga).toLocaleDateString('es-CO')}</p></div></div><button type="button" onClick={() => void download(support)} className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-semibold text-violet-800 hover:bg-violet-50"><Download size={14} />Descargar</button></li>)}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}