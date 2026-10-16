import { useEffect, useState } from 'react';
import { Document, Page, PDFDownloadLink, StyleSheet, Text, View } from '@react-pdf/renderer';
import { Download } from 'lucide-react';
import { ReporteOrientacion } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: '#1e293b', fontFamily: 'Helvetica' },
  title: { fontSize: 18, color: '#6d28d9', marginBottom: 6 },
  subtitle: { fontSize: 9, color: '#64748b', marginBottom: 18 },
  heading: { flexDirection: 'row', backgroundColor: '#ede9fe', padding: 7, fontWeight: 'bold' },
  row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingVertical: 7 },
  date: { width: '19%' },
  learner: { width: '18%' },
  status: { width: '14%' },
  reason: { width: '30%', paddingRight: 6 },
  changeReason: { width: '19%' },
  empty: { marginTop: 18, color: '#64748b' },
});

type ReportRange = 'month' | 'three-months' | 'semester' | 'custom';

export function OrientacionesPdfReport() {
  const [range, setRange] = useState<ReportRange>('month');
  const [customMonths, setCustomMonths] = useState(1);
  const [items, setItems] = useState<ReporteOrientacion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const months = range === 'three-months' ? 3 : range === 'semester' ? 6 : range === 'custom' ? customMonths : 1;

  useEffect(() => {
    let active = true;
    const now = new Date();
    const desde = new Date(now.getFullYear(), now.getMonth() - months + 1, 1);
    const hasta = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    setLoading(true);
    setError('');
    serenaApi.getReporteOrientacionesDesdeApi(desde, hasta)
      .then((data) => { if (active) setItems(data); })
      .catch((reason: unknown) => {
        if (active) {
          setItems([]);
          setError(reason instanceof Error ? reason.message : 'No se pudo cargar el reporte.');
        }
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [months]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-bold text-slate-900">Reporte de orientaciones</h2>
          <p className="mt-1 text-xs text-slate-500">Descarga un PDF con fecha, motivo, aprendiz y estado.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="report-range" className="sr-only">Rango del reporte</label>
          <select id="report-range" value={range} onChange={(event) => setRange(event.target.value as ReportRange)} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
            <option value="month">Mes actual</option>
            <option value="three-months">Últimos 3 meses</option>
            <option value="semester">Semestre</option>
            <option value="custom">Rango personalizado</option>
          </select>
          {range === 'custom' && (
            <>
              <label htmlFor="custom-months" className="sr-only">Cantidad de meses</label>
              <select id="custom-months" value={customMonths} onChange={(event) => setCustomMonths(Number(event.target.value))} className="rounded-lg border border-slate-200 px-3 py-2 text-sm">
                {[1, 2, 3, 4, 5, 6].map((month) => <option key={month} value={month}>{month} {month === 1 ? 'mes' : 'meses'}</option>)}
              </select>
            </>
          )}
          {loading ? <span className="text-sm text-slate-500">Cargando...</span> : (
            <PDFDownloadLink
              document={<OrientacionesDocument items={items} months={months} />}
              fileName={`orientaciones-${months}-meses.pdf`}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-700 px-3 py-2 text-sm font-semibold text-white hover:bg-violet-600"
            >
              {({ loading: creating }) => <><Download className="h-4 w-4" />{creating ? 'Generando...' : 'Descargar PDF'}</>}
            </PDFDownloadLink>
          )}
        </div>
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
      {!loading && !error && <p className="mt-3 text-xs text-slate-500">{items.length} orientaciones en el rango elegido.</p>}
    </section>
  );
}

function OrientacionesDocument({ items, months }: { items: ReporteOrientacion[]; months: number }) {
  const dateFormatter = new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' });
  return (
    <Document title="Reporte de orientaciones SERENA" author="SERENA">
      <Page size="A4" style={styles.page} wrap>
        <Text style={styles.title}>Reporte de orientaciones psicosociales</Text>
        <Text style={styles.subtitle}>Rango: últimos {months} {months === 1 ? 'mes' : 'meses'} · Generado: {dateFormatter.format(new Date())}</Text>
        <View style={styles.heading} fixed>
          <Text style={styles.date}>Fecha</Text><Text style={styles.learner}>Aprendiz</Text>
          <Text style={styles.status}>Estado</Text><Text style={styles.reason}>Motivo</Text>
          <Text style={styles.changeReason}>Motivo de cambio</Text>
        </View>
        {items.length === 0
          ? <Text style={styles.empty}>No hay orientaciones registradas para el periodo seleccionado.</Text>
          : items.map((item) => (
              <View key={item.id_orientacion} style={styles.row} wrap={false}>
                <Text style={styles.date}>{dateFormatter.format(new Date(item.fecha_hora))}</Text>
                <Text style={styles.learner}>{item.aprendiz}</Text>
                <Text style={styles.status}>{item.estado}</Text>
                <Text style={styles.reason}>{item.motivo}</Text>
                <Text style={styles.changeReason}>{item.motivo_cambio || '—'}</Text>
              </View>
            ))}
        <Text fixed style={{ position: 'absolute', bottom: 16, right: 32, color: '#94a3b8', fontSize: 8 }} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
      </Page>
    </Document>
  );
}
