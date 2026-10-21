import { useEffect, useState } from 'react';
import { ArrowLeft, BookOpen, CalendarCheck, Download, FileText, Search, Users } from 'lucide-react';
import {
  AdminPsicosocial,
  AdminPsicosocialDetail,
  Usuario,
} from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface AdminDashboardProps {
  currentUser: Usuario;
}

const dateFormatter = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

export function AdminDashboard({ currentUser }: AdminDashboardProps) {
  const initialId = Number(window.location.pathname.match(/^\/admin\/psicosocial\/(\d+)$/)?.[1]);
  const [selectedId, setSelectedId] = useState<number | null>(Number.isFinite(initialId) && initialId > 0 ? initialId : null);
  const [search, setSearch] = useState('');
  const [professionals, setProfessionals] = useState<AdminPsicosocial[]>([]);
  const [detail, setDetail] = useState<AdminPsicosocialDetail | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    serenaApi.getAdminPsicosociales(search)
      .then((items) => { if (active) setProfessionals(items); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No fue posible cargar el directorio.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [search]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoading(true);
    setError('');
    serenaApi.getAdminPsicosocialDetail(selectedId)
      .then((value) => { if (active) setDetail(value); })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : 'No fue posible cargar el detalle.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [selectedId]);

  useEffect(() => {
    const syncPath = () => {
      const id = Number(window.location.pathname.match(/^\/admin\/psicosocial\/(\d+)$/)?.[1]);
      setSelectedId(Number.isFinite(id) && id > 0 ? id : null);
    };
    window.addEventListener('popstate', syncPath);
    return () => window.removeEventListener('popstate', syncPath);
  }, []);

  const openDetail = (professional: AdminPsicosocial) => {
    window.history.pushState({}, '', `/admin/psicosocial/${professional.id_usuario}`);
    setSelectedId(professional.id_usuario);
  };

  const backToDirectory = () => {
    window.history.pushState({}, '', '/admin/dashboard');
    setSelectedId(null);
  };

  const exportDirectory = () => downloadCsv('directorio-psicosociales.csv', [
    ['Nombre', 'Correo', 'Documento', 'Aprendices vinculados', 'Orientaciones realizadas'],
    ...professionals.map((item) => [
      item.nombre,
      item.correo,
      item.documento || '',
      item.aprendices_asignados,
      item.orientaciones_realizadas,
    ]),
  ]);

  const exportDetail = () => {
    if (!detail) return;
    downloadCsv(`actividad-psicosocial-${detail.id_usuario}.csv`, [
      ['Tipo', 'Fecha', 'Nombre', 'Correo o estado', 'Documento o motivo', 'Detalle'],
      ...detail.orientaciones.map((item) => [
        'Orientación',
        item.fecha_hora,
        item.aprendiz,
        item.estado,
        item.motivo,
        item.motivo_rechazo_cancelacion || '',
      ]),
      ...detail.aprendices.map((item) => [
        'Aprendiz vinculado',
        item.ultima_orientacion || '',
        item.nombre,
        item.correo,
        item.num_ficha || '',
        '',
      ]),
      ...detail.publicaciones.map((item) => [
        'Informe o acta',
        item.fecha_publicacion,
        item.titulo,
        '',
        '',
        '',
      ]),
    ]);
  };

  if (selectedId !== null) {
    return (
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-12">
        <button onClick={backToDirectory} className="flex w-fit items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900">
          <ArrowLeft className="h-4 w-4" /> Volver al directorio
        </button>
        {detail && (
          <button onClick={exportDetail} className="flex w-fit items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-50">
            <Download className="h-4 w-4" /> Descargar actividad CSV
          </button>
        )}
        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {loading && !detail ? <p className="text-sm text-slate-500">Cargando métricas...</p> : detail && (
          <>
            <header className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Actividad psicosocial</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900">{detail.nombre}</h1>
              <p className="mt-1 text-sm text-slate-600">{detail.correo} · Documento: {detail.documento || 'No registrado'}</p>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <Metric icon={<Users />} label="Aprendices vinculados" value={detail.aprendices_asignados} />
              <Metric icon={<CalendarCheck />} label="Realizadas" value={detail.orientaciones_realizadas} />
              <Metric icon={<BookOpen />} label="Pendientes" value={detail.orientaciones_pendientes} />
              <Metric icon={<CalendarCheck />} label="Canceladas" value={detail.orientaciones_canceladas} />
              <Metric icon={<CalendarCheck />} label="Rechazadas" value={detail.orientaciones_rechazadas} />
              <Metric icon={<FileText />} label="Informes y actas" value={detail.publicaciones.length} />
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-lg font-bold text-slate-900">Historial de orientaciones</h2>
              {detail.orientaciones.length === 0 ? <Empty>Sin orientaciones registradas.</Empty> : (
                <div className="space-y-3">
                  {detail.orientaciones.map((item) => (
                    <article key={item.id_orientacion} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                      <div className="flex flex-wrap justify-between gap-2">
                        <strong className="text-sm text-slate-900">{item.aprendiz}</strong>
                        <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-800">{item.estado}</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-500">{dateFormatter.format(new Date(item.fecha_hora))}</p>
                      <p className="mt-2 text-sm text-slate-700">{item.motivo}</p>
                      {item.motivo_rechazo_cancelacion && (
                        <p className="mt-2 text-xs text-rose-700">Motivo de rechazo o cancelación: {item.motivo_rechazo_cancelacion}</p>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="grid gap-5 lg:grid-cols-2">
              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-3 text-lg font-bold text-slate-900">Aprendices vinculados</h2>
                {detail.aprendices.length === 0 ? <Empty>Sin aprendices en el historial.</Empty> : detail.aprendices.map((learner) => (
                  <article key={learner.id_usuario} className="border-b border-slate-100 py-3 last:border-0">
                    <p className="text-sm font-semibold text-slate-800">{learner.nombre}</p>
                    <p className="text-xs text-slate-500">{learner.correo} · Ficha {learner.num_ficha || 'No registrada'}</p>
                    <p className="mt-1 text-[11px] text-slate-400">
                      Primera: {learner.primera_orientacion ? dateFormatter.format(new Date(learner.primera_orientacion)) : '—'} ·
                      Última: {learner.ultima_orientacion ? dateFormatter.format(new Date(learner.ultima_orientacion)) : '—'}
                    </p>
                  </article>
                ))}
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5">
                <h2 className="mb-3 flex items-center gap-2 text-lg font-bold text-slate-900"><FileText className="h-5 w-5 text-violet-700" /> Informes y actas publicados</h2>
                {detail.publicaciones.length === 0 ? <Empty>Sin informes o actas publicados.</Empty> : detail.publicaciones.map((item) => (
                  <article key={item.id_publicacion} className="border-b border-slate-100 py-3 last:border-0">
                    <p className="text-sm font-semibold text-slate-800">{item.titulo}</p>
                    <p className="mt-1 text-xs text-slate-500">{dateFormatter.format(new Date(item.fecha_publicacion))}</p>
                  </article>
                ))}
              </section>
            </div>
          </>
        )}
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-5 pb-12">
      <header className="rounded-2xl border border-slate-200 bg-white p-5">
        <p className="text-xs font-bold uppercase tracking-wider text-violet-700">Administración SERENA</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-900">Directorio de profesionales psicosociales</h1>
        <p className="mt-1 text-sm text-slate-600">Hola, {currentUser.nombre_usuario}. Consulta actividad y métricas profesionales.</p>
        <label className="mt-4 flex max-w-xl items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            aria-label="Buscar profesionales psicosociales"
            className="w-full bg-transparent py-2.5 text-sm outline-none"
            placeholder="Buscar por nombre, correo o documento"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </label>
        <button onClick={exportDirectory} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm font-semibold text-violet-800 hover:bg-violet-50">
          <Download className="h-4 w-4" /> Descargar directorio CSV
        </button>
      </header>
      {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && professionals.length === 0 ? <p className="text-sm text-slate-500">Cargando directorio...</p> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {professionals.map((item) => (
            <button
              key={item.id_usuario}
              onClick={() => openDetail(item)}
              className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-800">
                {item.nombre.slice(0, 1).toUpperCase()}
              </span>
              <h2 className="mt-3 font-bold text-slate-900">{item.nombre}</h2>
              <p className="mt-1 break-all text-xs text-slate-500">{item.correo}</p>
              <p className="mt-1 text-xs text-slate-500">Documento: {item.documento || 'No registrado'}</p>
              <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs">
                <span className="text-slate-500">Aprendices <strong className="block text-base text-slate-900">{item.aprendices_asignados}</strong></span>
                <span className="text-slate-500">Orientaciones realizadas <strong className="block text-base text-slate-900">{item.orientaciones_realizadas}</strong></span>
              </div>
            </button>
          ))}
          {professionals.length === 0 && !loading && <Empty>No hay profesionales que coincidan con la búsqueda.</Empty>}
        </div>
      )}
    </section>
  );
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map((value) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  }).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4">
      <span className="text-violet-700">{icon}</span>
      <p className="mt-2 text-xs text-slate-500">{label}</p>
      <strong className="text-2xl text-slate-900">{value}</strong>
    </article>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-5 text-sm text-slate-500">{children}</p>;
}
