import React, { useState } from 'react';
import {
  Smile,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Info,
  Calendar,
  CheckCircle2,
  TrendingUp,
  FolderPlus,
  ShieldCheck,
  Heart,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { Usuario, EstadoDeAnimo } from '../types/serena.types';
import { serenaApi } from '../services/serena-api.service';

interface EstadoDeAnimoViewProps {
  currentUser: Usuario;
  historialEstados: EstadoDeAnimo[];
  onEstadoRegistrado: () => void;
}

interface AvatarMoodOption {
  id: 'Feliz' | 'Calmado' | 'Ansioso' | 'Triste' | 'Motivado';
  nombre: string;
  subtitulo: string;
  colorGrad: string;
  textColor: string;
  badgeBg: string;
  primaryImage: string;
  fallbackSvg: string;
  valorNumerico: number;
  fraseConsejo: string;
}

const CMTC_MOODS: AvatarMoodOption[] = [
  {
    id: 'Feliz',
    nombre: 'Feliz / Optimista',
    subtitulo: 'Energía alta y plenitud',
    colorGrad: 'from-emerald-400 to-teal-600',
    textColor: 'text-emerald-800',
    badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    primaryImage: '/IMG/cmtc_feliz.png',
    fallbackSvg: '/IMG/cmtc_feliz.svg',
    valorNumerico: 5,
    fraseConsejo: '¡Excelente día! Aprovecha este impulso positivo para compartir con tus compañeros de ficha.',
  },
  {
    id: 'Calmado',
    nombre: 'Calmado / Sereno',
    subtitulo: 'Paz mental y equilibrio',
    colorGrad: 'from-sky-400 to-blue-600',
    textColor: 'text-blue-800',
    badgeBg: 'bg-blue-100 text-blue-900 border-blue-300',
    primaryImage: '/IMG/cmtc_calmado.png',
    fallbackSvg: '/IMG/cmtc_calmado.svg',
    valorNumerico: 4,
    fraseConsejo: 'La tranquilidad es tu mejor aliada para la concentración en el código y el taller textil.',
  },
  {
    id: 'Ansioso',
    nombre: 'Ansioso / Inquieto',
    subtitulo: 'Tensión o sobrepensamiento',
    colorGrad: 'from-amber-400 to-amber-600',
    textColor: 'text-amber-800',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    primaryImage: '/IMG/cmtc_ansioso.png',
    fallbackSvg: '/IMG/cmtc_ansioso.svg',
    valorNumerico: 2,
    fraseConsejo: 'Recuerda hacer una pausa activa de respiración 4x4. Si la sobrecarga persiste, agenda con tu psicólogo.',
  },
  {
    id: 'Triste',
    nombre: 'Triste / Desanimado',
    subtitulo: 'Baja energía o nostalgia',
    colorGrad: 'from-slate-400 to-slate-600',
    textColor: 'text-slate-700',
    badgeBg: 'bg-slate-200 text-slate-800 border-slate-300',
    primaryImage: '/IMG/cmtc_triste.png',
    fallbackSvg: '/IMG/cmtc_triste.svg',
    valorNumerico: 1,
    fraseConsejo: 'Está bien no estar bien todo el tiempo. En Bienestar al Aprendiz estamos para escucharte sin juzgarte.',
  },
  {
    id: 'Motivado',
    nombre: 'Motivado / Enérgico',
    subtitulo: 'Foco activo para crear',
    colorGrad: 'from-rose-400 to-red-600',
    textColor: 'text-red-800',
    badgeBg: 'bg-rose-100 text-rose-900 border-rose-300',
    primaryImage: '/IMG/cmtc_motivado.png',
    fallbackSvg: '/IMG/cmtc_motivado.svg',
    valorNumerico: 5,
    fraseConsejo: '¡Gran determinación! Canaliza esa fuerza para avanzar en tu proyecto formativo del SENA.',
  },
];

export const EstadoDeAnimoView: React.FC<EstadoDeAnimoViewProps> = ({
  currentUser,
  historialEstados = [],
  onEstadoRegistrado,
}) => {
  // Centro de formación fijo según credenciales del usuario (no modificable en la vista)
  const centroUsuario = currentUser.centro_formacion || 'CMTC';
  const [selectedIndex, setSelectedIndex] = useState<number>(1); // Default Calmado
  const [notaPersonal, setNotaPersonal] = useState<string>('');
  const [intensidad, setIntensidad] = useState<number>(4);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [mostrarGuiaIMG, setMostrarGuiaIMG] = useState<boolean>(false);
  const [imgErrors, setImgErrors] = useState<{ [key: string]: boolean }>({});
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const currentMood = CMTC_MOODS[selectedIndex];

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : CMTC_MOODS.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < CMTC_MOODS.length - 1 ? prev + 1 : 0));
  };

  const handleGuardarEstado = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const avatarFinalPath = imgErrors[currentMood.id]
      ? currentMood.fallbackSvg
      : currentMood.primaryImage;

    serenaApi.registrarEstadoDeAnimo(
      currentUser.id_usuario,
      currentMood.id,
      centroUsuario,
      avatarFinalPath,
      notaPersonal,
      intensidad
    );

    setTimeout(() => {
      setIsSubmitting(false);
      setNotaPersonal('');
      onEstadoRegistrado();
      setMensajeExito(`¡Tu estado de ánimo "${currentMood.nombre}" se guardó exitosamente!`);
      setTimeout(() => setMensajeExito(null), 4000);
    }, 300);
  };

  // Datos para la gráfica de evolución (RF-EA-02)
  const chartData = (historialEstados || []).map((h) => {
    const fecha = new Date(h.fecha_estado);
    const moodRef = CMTC_MOODS.find((m) => m.id === h.nombre_estado);
    return {
      fecha: fecha.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' }),
      estado: h.nombre_estado,
      valor: moodRef?.valorNumerico || 3,
      intensidad: h.intensidad || 3,
    };
  });

  return (
    <div className="max-w-5xl mx-auto flex flex-col gap-4 pb-12 animate-in fade-in duration-150">
      {/* Cabecera Principal */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87] font-semibold text-xs">
              Módulo de Acompañamiento Emocional
            </span>
            {/* Credenciales del Centro: No modificables, provienen de la cuenta */}
            <span className="text-xs text-slate-500 font-normal">
              Centro asignado: <strong className="text-slate-800 font-semibold">{centroUsuario} - SENA</strong>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Registro de Estado de Ánimo & Selección de Avatares
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
            Cada día representa una nueva oportunidad. Selecciona el avatar que mejor refleje cómo te sientes hoy en tu formación en el SENA.
          </p>
        </div>

        {/* Botón de instrucciones de imágenes */}
        <button
          onClick={() => setMostrarGuiaIMG(!mostrarGuiaIMG)}
          className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 shrink-0 cursor-pointer"
        >
          <FolderPlus className="w-4 h-4 text-slate-600" />
          <span>{mostrarGuiaIMG ? 'Ocultar Nombres de Archivos' : 'Ver Nombres para Carpeta /IMG'}</span>
        </button>
      </div>

      {/* Banner de Guía para la Carpeta /IMG/ */}
      {mostrarGuiaIMG && (
        <div className="bg-transparent rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-800 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 mb-2 font-bold text-slate-900 text-sm">
            <FolderPlus className="w-4 h-4 text-[#7E22CE]" />
            <span>Nombres de Archivos para la Carpeta /IMG (Público)</span>
          </div>
          <p className="mb-3 text-slate-600">
            Sube tus fotos correspondientes al <strong>Centro {centroUsuario}</strong> a la carpeta <code>/public/IMG/</code> con los siguientes nombres exactos:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 font-mono text-[11px]">
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800">1. Feliz</span>
              <p className="text-slate-500 mt-0.5">cmtc_feliz.png</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800">2. Calmado</span>
              <p className="text-slate-500 mt-0.5">cmtc_calmado.png</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800">3. Ansioso</span>
              <p className="text-slate-500 mt-0.5">cmtc_ansioso.png</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800">4. Triste</span>
              <p className="text-slate-500 mt-0.5">cmtc_triste.png</p>
            </div>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-white">
              <span className="font-semibold text-slate-800">5. Motivado</span>
              <p className="text-slate-500 mt-0.5">cmtc_motivado.png</p>
            </div>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">
            💡 <em>Nota:</em> Si aún no has subido las imágenes a la carpeta <code>/public/IMG/</code>, la aplicación utiliza automáticamente los avatares vectoriales integrados.
          </p>
        </div>
      )}

      {/* =========================================================================
          CARRUSEL DE AVATARES NATURAL & INTEGRADO (Plano, sobrio y orgánico)
          ========================================================================= */}
      <div className="relative bg-transparent rounded-2xl p-4 sm:p-6 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 overflow-hidden">
        {/* Indicador superior del carrusel */}
        <div className="text-center mb-5">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Avatar del Centro {centroUsuario} #{selectedIndex + 1} de 5
          </span>
        </div>

        {/* Stage Coverflow Orgánico */}
        <div className="relative flex items-center justify-center min-h-[280px] sm:min-h-[310px] gap-2 sm:gap-6">
          {/* Botón Flecha Izquierda */}
          <button
            onClick={handlePrev}
            className="absolute left-1 sm:left-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-all border border-slate-200 shadow-xs cursor-pointer active:scale-95"
            title="Avatar anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Tarjetas Coverflow: Izquierda, Centro (Destacada), Derecha */}
          <div className="flex items-center justify-center gap-4 sm:gap-8 w-full max-w-2xl px-4">
            {/* Tarjeta Izquierda (Preview) */}
            {(() => {
              const prevIdx = (selectedIndex - 1 + CMTC_MOODS.length) % CMTC_MOODS.length;
              const prevMood = CMTC_MOODS[prevIdx];
              return (
                <button
                  onClick={handlePrev}
                  className="hidden md:flex flex-col items-center opacity-35 hover:opacity-70 transition-all transform scale-85 -rotate-3 hover:scale-90 cursor-pointer select-none"
                >
                  <div className="w-28 h-40 rounded-2xl bg-white p-3 border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                    <div className="w-18 h-18 rounded-2xl overflow-hidden mb-2">
                      <img
                        src={
                          imgErrors[prevMood.id] ? prevMood.fallbackSvg : prevMood.primaryImage
                        }
                        alt={prevMood.nombre}
                        className="w-full h-full object-contain"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [prevMood.id]: true }))
                        }
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{prevMood.id}</p>
                  </div>
                </button>
              );
            })()}

            {/* Tarjeta Central (ACTIVA / DESTACADA) */}
            <div className="flex flex-col items-center z-10 transform transition-all duration-200 scale-100">
              <div className="w-68 sm:w-80 rounded-2xl bg-white p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col items-center text-center">
                {/* Visual del Avatar */}
                <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl overflow-hidden mb-3 p-2 bg-slate-50 border border-slate-100 flex items-center justify-center group">
                  <img
                    src={
                      imgErrors[currentMood.id]
                        ? currentMood.fallbackSvg
                        : currentMood.primaryImage
                    }
                    alt={currentMood.nombre}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-200"
                    onError={() =>
                      setImgErrors((prev) => ({ ...prev, [currentMood.id]: true }))
                    }
                  />
                </div>

                {/* Info del Estado */}
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87] mb-1.5 uppercase tracking-wider">
                  {currentMood.id}
                </span>
                <h3 className="text-base sm:text-lg font-bold text-slate-900">{currentMood.nombre}</h3>
                <p className="text-xs text-slate-500 mt-0.5 max-w-xs">{currentMood.subtitulo}</p>

                {/* Consejo Psicológico SENA */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 text-[11px] text-slate-600 flex items-center gap-1.5 text-left">
                  <Sparkles className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
                  <span>{currentMood.fraseConsejo}</span>
                </div>
              </div>
            </div>

            {/* Tarjeta Derecha (Preview) */}
            {(() => {
              const nextIdx = (selectedIndex + 1) % CMTC_MOODS.length;
              const nextMood = CMTC_MOODS[nextIdx];
              return (
                <button
                  onClick={handleNext}
                  className="hidden md:flex flex-col items-center opacity-35 hover:opacity-70 transition-all transform scale-85 rotate-3 hover:scale-90 cursor-pointer select-none"
                >
                  <div className="w-28 h-40 rounded-2xl bg-white p-3 border border-slate-200 flex flex-col items-center justify-center shadow-xs">
                    <div className="w-18 h-18 rounded-2xl overflow-hidden mb-2">
                      <img
                        src={
                          imgErrors[nextMood.id] ? nextMood.fallbackSvg : nextMood.primaryImage
                        }
                        alt={nextMood.nombre}
                        className="w-full h-full object-contain"
                        onError={() =>
                          setImgErrors((prev) => ({ ...prev, [nextMood.id]: true }))
                        }
                      />
                    </div>
                    <p className="text-xs font-semibold text-slate-700">{nextMood.id}</p>
                  </div>
                </button>
              );
            })()}
          </div>

          {/* Botón Flecha Derecha */}
          <button
            onClick={handleNext}
            className="absolute right-1 sm:right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-slate-700 flex items-center justify-center transition-all border border-slate-200 shadow-xs cursor-pointer active:scale-95"
            title="Siguiente avatar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Chips selectores directos inferiores */}
        <div className="mt-5 flex items-center justify-center gap-1.5 flex-wrap">
          {CMTC_MOODS.map((mood, idx) => (
            <button
              key={mood.id}
              onClick={() => setSelectedIndex(idx)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                selectedIndex === idx
                  ? 'bg-slate-900 text-white'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
              }`}
            >
              {mood.id}
            </button>
          ))}
        </div>
      </div>

      {/* Formulario para Guardar Registro Diario (RF-EA-01) */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-4">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-0.5 flex items-center gap-2">
            <span>Registrar Emoción del Día</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#7E22CE]/10 text-[#581C87]">
              {currentMood.id}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            Este registro alimenta tu gráfica de evolución emocional y permite a tu psicólogo realizar acompañamientos más asertivos.
          </p>
        </div>

        <form onSubmit={handleGuardarEstado} className="flex flex-col gap-4">
          {/* Intensidad emocional (1 a 5) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">
                Nivel de intensidad de esta emoción (1 a 5):
              </label>
              <span className="text-xs font-bold text-[#581C87] bg-[#7E22CE]/10 px-2 py-0.5 rounded-md">
                Nivel {intensidad} de 5
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={intensidad}
              onChange={(e) => setIntensidad(Number(e.target.value))}
              className="w-full accent-[#7E22CE] h-1.5 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-normal">
              <span>1: Muy leve</span>
              <span>3: Moderado</span>
              <span>5: Muy intenso</span>
            </div>
          </div>

          {/* Nota opcional */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nota personal o reflexión (Opcional):
            </label>
            <textarea
              rows={2}
              value={notaPersonal}
              onChange={(e) => setNotaPersonal(e.target.value)}
              placeholder="¿Qué eventos o pensamientos influyeron en cómo te sientes hoy? (Ej: Entrega de proyectos, buena charla con compañeros...)"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-white/70 focus:bg-white focus:outline-none focus:border-[#7E22CE] transition-colors text-slate-800 placeholder-slate-400"
            />
          </div>

          {mensajeExito && (
            <div className="p-2.5 bg-[#EBF7E6] text-[#2E8500] rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 text-[#39A900]" />
              <span>{mensajeExito}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#39A900]" />
              Tus datos son custodiados con confidencialidad ética SENA
            </span>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#39A900] hover:bg-[#2E8500] active:scale-98 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center gap-2 cursor-pointer self-end sm:self-auto"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-white" />
              <span>{isSubmitting ? 'Guardando...' : 'Confirmar y Guardar Emoción'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* CONSULTA DE EVOLUCIÓN EMOCIONAL (GRÁFICA RECHARTS - RF-EA-02) */}
      <div className="bg-transparent rounded-2xl p-4 sm:p-5 border border-transparent hover:bg-white hover:border-slate-200/70 hover:shadow-xs transition-all duration-150 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#7E22CE]" />
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Evolución Emocional Semanal
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Gráfica histórica alimentada por tus registros diarios de estado de ánimo (RF-EA-02)
            </p>
          </div>

          <span className="text-xs font-semibold text-[#581C87] bg-[#7E22CE]/10 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {chartData.length} registros analizados
          </span>
        </div>

        {/* Gráfico de Área */}
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7E22CE" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#7E22CE" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="fecha" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                tick={{ fontSize: 11, fill: '#64748B' }}
                stroke="#CBD5E1"
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-2 rounded-xl text-xs shadow-md border border-slate-800">
                        <p className="font-bold text-slate-100">{data.estado}</p>
                        <p className="text-slate-300">Intensidad: {data.intensidad}/5</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{data.fecha}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="valor"
                stroke="#7E22CE"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorMood)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Histórico en tarjetas planas */}
        <div className="pt-2 border-t border-slate-100">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Últimos registros:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {(historialEstados || []).slice(-6).reverse().map((item) => (
              <div
                key={item.id_estado}
                className="p-2.5 rounded-xl border border-transparent hover:border-slate-200/70 bg-transparent hover:bg-white transition-all flex items-center gap-2.5 text-xs"
              >
                <div className="w-8 h-8 rounded-lg overflow-hidden bg-slate-50 shrink-0 border border-slate-100">
                  <img
                    src={item.avatar_path}
                    alt={item.nombre_estado}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/IMG/cmtc_feliz.svg';
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-slate-800">{item.nombre_estado}</span>
                    <span className="text-[10px] text-slate-500">
                      (Nivel {item.intensidad || 4})
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    {new Date(item.fecha_estado).toLocaleDateString()}
                  </p>
                  {item.nota && (
                    <p className="text-[10px] text-slate-600 line-clamp-1 italic mt-0.5">
                      "{item.nota}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
