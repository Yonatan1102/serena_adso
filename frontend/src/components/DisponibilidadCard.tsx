import { useEffect, useState } from 'react';
import { Clock, Plus } from 'lucide-react';
import { Disponibilidad } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

const dias = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
];

export function DisponibilidadCard() {
  const [slots, setSlots] = useState<Disponibilidad[]>([]);
  const [dia, setDia] = useState(1);
  const [inicio, setInicio] = useState('09:00');
  const [fin, setFin] = useState('10:00');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const loadAvailability = async () => {
    try {
      setSlots(await serenaApi.getMisDisponibilidadesDesdeApi());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible consultar la disponibilidad.');
    }
  };

  useEffect(() => {
    void loadAvailability();
  }, []);

  const addAvailability = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    try {
      const created = await serenaApi.crearDisponibilidadEnApi({
        dia_semana: dia,
        hora_inicio: `${inicio}:00`,
        hora_fin: `${fin}:00`,
        estado: true,
      });
      setSlots((current) => [...current, created].sort((a, b) =>
        a.dia_semana - b.dia_semana || a.hora_inicio.localeCompare(b.hora_inicio)));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No fue posible guardar la franja.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5 text-violet-700" />
        <div>
          <h2 className="font-bold text-slate-900">Mi disponibilidad para orientaciones</h2>
          <p className="text-xs text-slate-500">Las franjas ocupadas dejan de estar disponibles para reserva.</p>
        </div>
      </div>

      <form onSubmit={addAvailability} className="grid gap-2 sm:grid-cols-4">
        <label className="text-xs font-semibold text-slate-600">
          Día
          <select value={dia} onChange={(event) => setDia(Number(event.target.value))} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm">
            {dias.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Inicio
          <input type="time" required value={inicio} onChange={(event) => setInicio(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
        </label>
        <label className="text-xs font-semibold text-slate-600">
          Fin
          <input type="time" required value={fin} onChange={(event) => setFin(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
        </label>
        <button disabled={saving} className="mt-auto flex items-center justify-center gap-1 rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-60">
          <Plus className="h-4 w-4" /> {saving ? 'Guardando...' : 'Agregar franja'}
        </button>
      </form>

      {error && <p role="alert" className="mt-3 text-xs text-rose-700">{error}</p>}
      <div className="mt-4 flex flex-wrap gap-2">
        {slots.map((slot) => (
          <span key={slot.id_disponibilidad} className={`rounded-lg px-2.5 py-1 text-xs font-medium ${slot.estado ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
            {dias.find((item) => item.value === slot.dia_semana)?.label} · {slot.hora_inicio.slice(0, 5)}–{slot.hora_fin.slice(0, 5)} · {slot.estado ? 'Disponible' : 'Ocupada'}
          </span>
        ))}
        {slots.length === 0 && !error && <p className="text-xs text-slate-400">Aún no has registrado franjas horarias.</p>}
      </div>
    </section>
  );
}
