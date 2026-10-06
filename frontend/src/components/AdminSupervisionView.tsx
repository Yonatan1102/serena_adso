import { useEffect, useState } from 'react';
import { Activity, ArrowUpRight, BookOpen, CalendarClock, Check, Clock3, LogOut, Plus, Search, ShieldCheck, Users, X } from 'lucide-react';
import { AdminPsicosocial, AdminPsicosocialDetail, Usuario } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface AdminSupervisionViewProps {
  currentUser: Usuario;
  onLogout: () => void;
}

const dateFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' });

export function AdminSupervisionView({ currentUser, onLogout }: AdminSupervisionViewProps) {
  const [professionals, setProfessionals] = useState<AdminPsicosocial[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<AdminPsicosocialDetail | null>(null);
  const [search, setSearch] = useState('');
  const [programas, setProgramas] = useState<Array<{ id_programa: number; nombre_programa: string }>>([]);
  const [fichas, setFichas] = useState<Array<{ id_ficha: number; codigo_ficha: string; programa: string; jornada: string }>>([]);
  const [programaId, setProgramaId] = useState('');
  const [fichaId, setFichaId] = useState('');
  const [selectedLearnerId, setSelectedLearnerId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [catalogError, setCatalogError] = useState('');
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);

  useEffect(() => {
    let active = true;
    setLoadingDirectory(true);
    serenaApi.getAdminPsicosociales(search)
      .then((items) => {
        if (!active) return;
        setProfessionals(items);
        setSelectedId((previous) => previous ?? items[0]?.id_usuario ?? null);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el directorio.');
      })
      .finally(() => { if (active) setLoadingDirectory(false); });
    return () => { active = false; };
  }, [search]);

  useEffect(() => {
    let active = true;
    serenaApi.getProgramasDesdeApi()
      .then((items) => { if (active) setProgramas(items); })
      .catch((cause: unknown) => {
        if (active) setCatalogError(cause instanceof Error ? cause.message : 'No se pudieron cargar los programas.');
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!programaId) {
      setFichas([]);
      setFichaId('');
      return;
    }
    let active = true;
    serenaApi.getFichasDeProgramaDesdeApi(Number(programaId))
      .then((items) => { if (active) setFichas(items); })
      .catch((cause: unknown) => {
        if (active) setCatalogError(cause instanceof Error ? cause.message : 'No se pudieron cargar las fichas.');
      });
    return () => { active = false; };
  }, [programaId]);

  useEffect(() => {
    if (selectedId === null) {
      setDetail(null);
      return;
    }
    let active = true;
    setLoadingDetail(true);
    setError('');
    setSelectedLearnerId(null);
    serenaApi.getAdminPsicosocialDetail(selectedId)
      .then((value) => { if (active) setDetail(value); })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'No se pudo cargar el detalle.');
      })
      .finally(() => { if (active) setLoadingDetail(false); });
    return () => { active = false; };
  }, [selectedId]);

  const refreshSelected = async () => {
    if (selectedId === null) return;
    const [updatedDetail, updatedList] = await Promise.all([
      serenaApi.getAdminPsicosocialDetail(selectedId),
      serenaApi.getAdminPsicosociales(search),
    ]);
    setDetail(updatedDetail);
    setProfessionals(updatedList);
  };

  const assignFicha = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (selectedId === null || !fichaId) return;
    setSavingAssignment(true);
    setError('');
    try {
      await serenaApi.assignFichaToPsicosocial(selectedId, Number(fichaId));
      setFichaId('');
      await refreshSelected();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo asignar la ficha.');
    } finally {
      setSavingAssignment(false);
    }
  };

  const unassignFicha = async (idFicha: number) => {
    if (selectedId === null) return;
    setError('');
    try {
      await serenaApi.unassignFichaFromPsicosocial(selectedId, idFicha);
      await refreshSelected();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'No se pudo retirar la ficha.');
    }
  };

  const selectedProfessional = professionals.find((item) => item.id_usuario === selectedId) ?? null;
  const selectedLearner = detail?.aprendices.find((item) => item.id_usuario === selectedLearnerId) ?? null;
  const learnerOrientations = selectedLearner
    ? detail?.orientaciones.filter((item) => item.id_aprendiz === selectedLearner.id_usuario) ?? []
    : [];
  const availableFichas = fichas.filter((item) => !detail?.fichas.some((assigned) => assigned.id_ficha === item.id_ficha));

  return (
    <div className="min-h-screen bg-[#f7f4fb] text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 sm:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 text-violet-800"><ShieldCheck size={21} /></div>
            <div>
              <p className="text-sm font-bold">SERENA <span className="font-normal text-slate-400">/ Supervisión</span></p>
              <p className="text-xs text-slate-500">Administración · {currentUser.nombre_usuario}</p>
            </div>
          </div>
          <button type="button" onClick={onLogout} title="Cerrar sesión" className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <LogOut size={16} /> <span className="hidden sm:inline">Cerrar sesión</span>
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-7 sm:py-8">
        <section className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase text-violet-800">Seguimiento de equipos</p>
            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">Comportamiento psicosocial</h1>
            <p className="mt-1 text-sm text-slate-600">Accesos, fichas asignadas y orientación a aprendices.</p>
          </div>
          <label className="flex w-full max-w-sm items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2.5">
            <Search size={17} className="shrink-0 text-slate-400" />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar profesional" className="w-full bg-transparent text-sm outline-none" aria-label="Buscar profesional" />
          </label>
        </section>

        {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores del profesional seleccionado">
          <SummaryMetric icon={<Users size={18} />} label="Fichas asignadas" value={detail?.fichas.length ?? 0} detail={selectedProfessional?.nombre ?? 'Selecciona un profesional'} />
          <SummaryMetric icon={<BookOpen size={18} />} label="Aprendices asignados" value={detail?.aprendices_asignados ?? 0} detail="En sus fichas activas" />
          <SummaryMetric icon={<CalendarClock size={18} />} label="Orientaciones realizadas" value={detail?.orientaciones_realizadas ?? 0} detail="De este profesional" />
          <SummaryMetric icon={<Activity size={18} />} label="Orientaciones pendientes" value={detail?.orientaciones_pendientes ?? 0} detail="De este profesional" />
        </section>

        <div className="grid items-start gap-5 lg:grid-cols-[minmax(290px,0.85fr)_minmax(0,2fr)]">
          <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <h2 className="text-sm font-bold">Profesionales psicosociales</h2>
              <p className="mt-0.5 text-xs text-slate-500">Selecciona uno para revisar sus asignaciones.</p>
            </div>
            {loadingDirectory && professionals.length === 0 ? <p className="p-4 text-sm text-slate-500">Cargando directorio…</p> : professionals.length === 0 ? <p className="p-4 text-sm text-slate-500">No hay profesionales registrados.</p> : (
              <div className="divide-y divide-slate-100">
                {professionals.map((professional) => {
                  const coverage = percent(professional.aprendices_con_orientacion, professional.aprendices_asignados);
                  const activity = percent(professional.orientaciones_realizadas, professional.orientaciones_totales);
                  return (
                    <button key={professional.id_usuario} type="button" onClick={() => setSelectedId(professional.id_usuario)} className={`w-full px-4 py-4 text-left transition hover:bg-violet-50/70 ${selectedId === professional.id_usuario ? 'bg-violet-50' : 'bg-white'}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{professional.nombre}</p>
                          <p className="mt-0.5 truncate text-xs text-slate-500">{professional.correo}</p>
                        </div>
                        <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${isRecent(professional.ultimo_acceso) ? 'bg-violet-600' : 'bg-slate-300'}`} title={isRecent(professional.ultimo_acceso) ? 'Acceso en los últimos 30 días' : 'Sin acceso reciente'} />
                      </div>
                      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                        <CompactStat label="Fichas" value={professional.fichas_asignadas} />
                        <CompactStat label="Aprendices" value={professional.aprendices_asignados} />
                        <CompactStat label="Orientaciones" value={professional.orientaciones_totales} />
                      </div>
                      <Progress label="Aprendices orientados" value={coverage} />
                      <Progress label="Orientaciones realizadas" value={activity} />
                      <p className="mt-2 text-[11px] text-slate-500">Último acceso: {formatDate(professional.ultimo_acceso)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="min-w-0 space-y-5">
            {loadingDetail && <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-500">Cargando relación profesional…</div>}
            {!loadingDetail && !detail && <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">Selecciona un profesional del directorio.</div>}
            {!loadingDetail && detail && (
              <>
                <section className="rounded-lg border border-slate-200 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase text-violet-800">Relación de acompañamiento</p>
                      <h2 className="mt-1 text-xl font-bold">{detail.nombre}</h2>
                      <p className="mt-1 text-sm text-slate-600">{detail.correo}{detail.documento ? ` · Documento ${detail.documento}` : ''}</p>
                      <p className="mt-1 text-xs text-slate-500">Último acceso: {formatDate(detail.ultimo_acceso)}</p>
                    </div>
                    <div className="flex gap-5 text-sm">
                      <div><strong className="block text-xl">{detail.fichas.length}</strong><span className="text-xs text-slate-500">Fichas</span></div>
                      <div><strong className="block text-xl">{detail.aprendices_asignados}</strong><span className="text-xs text-slate-500">Aprendices</span></div>
                      <div><strong className="block text-xl">{detail.orientaciones_realizadas}</strong><span className="text-xs text-slate-500">Realizadas</span></div>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 bg-white">
                  <div className="border-b border-slate-200 px-4 py-3">
                    <h3 className="text-sm font-bold">Fichas asignadas</h3>
                  </div>
                  {detail.fichas.length === 0 ? <p className="px-4 py-3 text-sm text-slate-500">Este profesional aún no tiene fichas asignadas.</p> : (
                    <ul className="divide-y divide-slate-100">
                      {detail.fichas.map((ficha) => (
                        <li key={ficha.id_ficha} className="flex items-center justify-between gap-3 px-4 py-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold">Ficha {ficha.codigo_ficha} <span className="font-normal text-slate-500">· {ficha.programa}</span></p>
                            <p className="mt-0.5 text-xs text-slate-500">{ficha.centro}{ficha.jornada ? ` · ${ficha.jornada}` : ''} · {ficha.aprendices_asignados} aprendices</p>
                          </div>
                          <button type="button" onClick={() => void unassignFicha(ficha.id_ficha)} title={`Retirar ficha ${ficha.codigo_ficha}`} className="rounded-md p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700"><X size={16} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form onSubmit={assignFicha} className="grid gap-2 border-t border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-[1fr_1fr_auto]">
                    <label className="text-xs font-medium text-slate-600">Programa
                      <select value={programaId} onChange={(event) => { setProgramaId(event.target.value); setFichaId(''); }} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm" required>
                        <option value="">Selecciona…</option>
                        {programas.map((item) => <option key={item.id_programa} value={item.id_programa}>{item.nombre_programa}</option>)}
                      </select>
                    </label>
                    <label className="text-xs font-medium text-slate-600">Ficha
                      <select value={fichaId} onChange={(event) => setFichaId(event.target.value)} className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm" disabled={!programaId || availableFichas.length === 0} required>
                        <option value="">{programaId ? 'Selecciona ficha…' : 'Elige programa primero'}</option>
                        {availableFichas.map((item) => <option key={item.id_ficha} value={item.id_ficha}>{item.codigo_ficha}{item.jornada ? ` · ${item.jornada}` : ''}</option>)}
                      </select>
                    </label>
                    <button type="submit" disabled={savingAssignment || !fichaId} className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-violet-800 px-4 text-sm font-semibold text-white hover:bg-violet-900 disabled:cursor-not-allowed disabled:opacity-50">
                      {savingAssignment ? <Activity size={16} className="animate-pulse" /> : <Plus size={16} />} Asignar
                    </button>
                    {catalogError && <p role="alert" className="text-xs text-rose-700 sm:col-span-3">{catalogError}</p>}
                  </form>
                </section>

                <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                  <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
                    <div><h3 className="text-sm font-bold">Aprendices por ficha</h3><p className="mt-0.5 text-xs text-slate-500">El contacto se determina por orientaciones registradas.</p></div>
                    <span className="text-xs text-slate-500">{detail.aprendices.length} personas</span>
                  </div>
                  {detail.aprendices.length === 0 ? <p className="px-4 py-5 text-sm text-slate-500">Las fichas asignadas no tienen aprendices relacionados.</p> : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[650px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-4 py-3 font-semibold">Aprendiz</th><th className="px-3 py-3 font-semibold">Ficha</th><th className="px-3 py-3 font-semibold">Contacto</th><th className="px-3 py-3 font-semibold">Orientaciones</th><th className="px-4 py-3 font-semibold">Última</th></tr></thead>
                        <tbody className="divide-y divide-slate-100">
                          {detail.aprendices.map((learner) => (
                            <tr key={`${learner.id_usuario}-${learner.id_ficha}`} className={selectedLearnerId === learner.id_usuario ? 'bg-violet-50/70' : ''}>
                              <td className="px-4 py-3"><button type="button" onClick={() => setSelectedLearnerId(learner.id_usuario)} className="text-left"><span className="block font-semibold text-slate-900 hover:text-violet-800">{learner.nombre}</span><span className="mt-0.5 block text-xs text-slate-500">{learner.correo}</span></button></td>
                              <td className="px-3 py-3 text-slate-700">{learner.codigo_ficha}</td>
                              <td className="px-3 py-3"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${learner.ha_hablado ? 'bg-violet-100 text-violet-900' : 'bg-slate-100 text-slate-600'}`}>{learner.ha_hablado ? <Check size={13} /> : <Clock3 size={13} />}{learner.ha_hablado ? 'Registrado' : 'Sin registro'}</span></td>
                              <td className="px-3 py-3 tabular-nums">{learner.orientaciones}</td>
                              <td className="px-4 py-3 text-xs text-slate-600">{formatDate(learner.ultima_orientacion)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>

                {selectedLearner && (
                  <section className="grid gap-5 xl:grid-cols-2">
                    <div className="rounded-lg border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 px-4 py-3"><h3 className="text-sm font-bold">Orientaciones · {selectedLearner.nombre}</h3></div>
                      {learnerOrientations.length === 0 ? <p className="px-4 py-4 text-sm text-slate-500">No hay orientaciones registradas para este aprendiz.</p> : (
                        <ul className="divide-y divide-slate-100">
                          {learnerOrientations.map((item) => <li key={item.id_orientacion} className="flex items-center justify-between gap-3 px-4 py-3"><span className="text-sm">{dateFormatter.format(new Date(item.fecha_hora))}</span><span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{item.estado}</span></li>)}
                        </ul>
                      )}
                    </div>
                    <div className="rounded-lg border border-slate-200 bg-white">
                      <div className="border-b border-slate-200 px-4 py-3"><h3 className="text-sm font-bold">Registros publicados</h3></div>
                      {detail.publicaciones.length === 0 ? <p className="px-4 py-4 text-sm text-slate-500">No hay publicaciones de seguimiento.</p> : (
                        <ul className="divide-y divide-slate-100">{detail.publicaciones.map((item) => <li key={item.id_publicacion} className="px-4 py-3"><p className="text-sm font-medium">{item.titulo}</p><p className="mt-1 text-xs text-slate-500">{dateFormatter.format(new Date(item.fecha_publicacion))}</p></li>)}</ul>
                      )}
                    </div>
                  </section>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function SummaryMetric({ icon, label, value, detail }: { icon: React.ReactNode; label: string; value: number; detail: string }) {
  return <article className="flex items-start gap-3 rounded-lg border border-violet-100 bg-white p-4"><span className="mt-0.5 text-violet-800">{icon}</span><div><p className="text-xs text-slate-500">{label}</p><strong className="mt-0.5 block text-2xl leading-7 tabular-nums">{value}</strong><p className="mt-1 text-xs text-slate-500">{detail}</p></div></article>;
}

function CompactStat({ label, value }: { label: string; value: number }) {
  return <div><span className="text-slate-500">{label}</span><strong className="ml-1 text-slate-900">{value}</strong></div>;
}

function Progress({ label, value }: { label: string; value: number }) {
  return <div className="mt-2"><div className="flex justify-between text-[11px] text-slate-500"><span>{label}</span><span>{value}%</span></div><div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-violet-700" style={{ width: `${value}%` }} /></div></div>;
}

function percent(numerator: number, denominator: number) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

function isRecent(value: string | null) {
  if (!value) return false;
  const date = new Date(value).getTime();
  return Number.isFinite(date) && Date.now() - date < 30 * 24 * 60 * 60 * 1000;
}

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : 'Sin accesos registrados';
}
