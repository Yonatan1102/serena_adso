/**
 * SERENA API Service
 * Arquitectura Clean Service compatible 1:1 con HttpClient de Angular y Entity Framework Core en C#
 * Simula persistencia en localStorage para previsualización interactiva y expone puente directo a la API .NET.
 */

import {
  Usuario,
  Cita,
  HistorialCita,
  HistorialClinico,
  CertificadoSoporte,
  AnotacionClinica,
  VotoUsuario,
  Diario,
  EstadoDeAnimo,
  Publicacion,
  Emergencia,
  Formulario,
  Comunidad,
  Menu,
  MenuRol,
  CustomFeed,
} from '../types/serena.types';

const STORAGE_KEYS = {
  USUARIOS: 'serena_usuarios',
  CITAS: 'serena_citas',
  HISTORIAL_CITAS: 'serena_historial_citas',
  HISTORIAL_CLINICO: 'serena_historial_clinico',
  SOPORTES_CLINICOS: 'serena_soportes_clinicos',
  ANOTACIONES_CLINICAS: 'serena_anotaciones_clinicas',
  VOTOS_USUARIOS: 'serena_votos_usuarios',
  DIARIO: 'serena_diario',
  ESTADO_ANIMO: 'serena_estado_animo',
  PUBLICACIONES: 'serena_publicaciones',
  EMERGENCIAS: 'serena_emergencias',
  FORMULARIOS: 'serena_formularios',
  COMUNIDADES: 'serena_comunidades',
  MENUS: 'serena_menus',
  MENU_ROL: 'serena_menu_rol',
  CUSTOM_FEEDS: 'serena_custom_feeds',
  CONFIG: 'serena_config',
};

// Datos semilla acordes al SRS IEEE 830 y centro CMTC
const USUARIOS_SEMILLA: Usuario[] = [
  {
    id_usuario: 1,
    nombre_usuario: 'Yonatan Acuña',
    email: 'yacuna@soy.sena.edu.co',
    id_rol: 1, // Aprendiz
    centro: 'CMTC',
    num_ficha: '3288046',
    avatar_url: '/IMG/cmtc_calmado.svg',
    telefono: '+57 301 234 5678',
    tipo_documento: 'CC',
    documento: '1023456789',
    programa_formacion: 'Análisis y Desarrollo de Software (ADSO)',
    jornada: 'Diurna',
    estado_formativo: 'Etapa Lectiva',
  },
  {
    id_usuario: 2,
    nombre_usuario: 'Josué Tovar',
    email: 'jtovar@soy.sena.edu.co',
    id_rol: 1, // Aprendiz
    centro: 'CMTC',
    num_ficha: '3288046',
    avatar_url: '/IMG/cmtc_feliz.svg',
    telefono: '+57 312 987 6543',
    tipo_documento: 'CC',
    documento: '1034567890',
    programa_formacion: 'Diseño y Confección Textil',
    jornada: 'Diurna',
    estado_formativo: 'Etapa Lectiva',
  },
  {
    id_usuario: 3,
    nombre_usuario: 'Camila Restrepo',
    email: 'crestrepo@soy.sena.edu.co',
    id_rol: 1, // Aprendiz
    centro: 'CMTC',
    num_ficha: '3288046',
    avatar_url: '/IMG/cmtc_motivado.svg',
    telefono: '+57 315 456 7890',
    tipo_documento: 'CC',
    documento: '1019876543',
    programa_formacion: 'Patronaje Industrial de Prendas de Vestir',
    jornada: 'Mixta',
    estado_formativo: 'Etapa Lectiva',
  },
  {
    id_usuario: 4,
    nombre_usuario: 'Dra. Laura Martínez',
    email: 'lmartinez@sena.edu.co',
    id_rol: 2, // Psicóloga
    centro: 'CMTC',
    especialidad: 'Psicología Clínica y Bienestar Integral',
    telefono: '+57 310 876 5432',
    horario_atencion: 'Lunes a Viernes 8:00 AM - 1:00 PM',
    disponibilidad: [
      'Lunes 09:00 AM',
      'Lunes 11:00 AM',
      'Martes 10:00 AM',
      'Miércoles 08:30 AM',
      'Jueves 02:00 PM',
      'Viernes 10:30 AM',
    ],
  },
  {
    id_usuario: 5,
    nombre_usuario: 'Dr. Carlos Pardo',
    email: 'cpardo@sena.edu.co',
    id_rol: 2, // Psicólogo
    centro: 'CMTC',
    especialidad: 'Orientación Vocacional y Manejo del Estrés',
    telefono: '+57 320 123 4567',
    horario_atencion: 'Lunes a Viernes 1:00 PM - 5:00 PM',
    disponibilidad: [
      'Lunes 02:00 PM',
      'Martes 03:00 PM',
      'Miércoles 04:00 PM',
      'Jueves 01:30 PM',
    ],
  },
  {
    id_usuario: 6,
    nombre_usuario: 'Ing. Coordinador Bienestar',
    email: 'bienestar.cmtc@sena.edu.co',
    id_rol: 3, // Administrador
    centro: 'CMTC',
  },
];

const COMUNIDADES_SEMILLA: Comunidad[] = [
  {
    id: 's/CMTC',
    centro: 'CMTC',
    sub_nombre: 'General',
    nombre_completo: 'Comunidad CMTC - Manufactura en Textiles y Cuero',
    descripcion: 'Espacio principal de acompañamiento y bienestar para aprendices y funcionarios del CMTC.',
    icono: 'Building2',
    es_oficial: true,
  },
  {
    id: 's/CMTC/economia',
    centro: 'CMTC',
    sub_nombre: 'Economía y Finanzas',
    nombre_completo: 's/CMTC/economia - Educación Financiera y Bienestar',
    descripcion: 'Pautas de ahorro, finanzas saludables y emprendimiento para aprendices.',
    icono: 'TrendingUp',
    es_oficial: false,
    creado_por_id: 4,
  },
  {
    id: 's/CMTC/salud-mental',
    centro: 'CMTC',
    sub_nombre: 'Salud Mental y Convivencia',
    nombre_completo: 's/CMTC/salud-mental - Hábitos para tu bienestar',
    descripcion: 'Píldoras de autocuidado, técnicas de respiración y actividades grupales.',
    icono: 'HeartHandshake',
    es_oficial: false,
    creado_por_id: 4,
  },
  {
    id: 's/CMTC/adso',
    centro: 'CMTC',
    sub_nombre: 'Desarrollo de Software ADSO',
    nombre_completo: 's/CMTC/adso - Acompañamiento Fichas de Tecnología',
    descripcion: 'Gestión de la fatiga cognitiva, pausas activas y burnout en tecnología.',
    icono: 'Code',
    es_oficial: false,
    creado_por_id: 5,
  },
  {
    id: 's/CMM',
    centro: 'CMM',
    sub_nombre: 'Centro Metalmecánica',
    nombre_completo: 'Comunidad CMM - Metalmecánica',
    descripcion: 'Próximamente disponible para aprendices del Centro de Metalmecánica.',
    icono: 'Wrench',
    es_oficial: true,
  },
  {
    id: 's/CEET',
    centro: 'CEET',
    sub_nombre: 'Electricidad y Telecomunicaciones',
    nombre_completo: 'Comunidad CEET - Electricidad y Telecomunicaciones',
    descripcion: 'Próximamente disponible para aprendices del Centro CEET.',
    icono: 'Zap',
    es_oficial: true,
  },
];

const PUBLICACIONES_SEMILLA: Publicacion[] = [
  {
    id_publicaciones: 1,
    titulo: 'Estrategias efectivas para el manejo del estrés en etapa lectiva y entregas de proyecto',
    contenido:
      'Estimados aprendices: recuerden que la fatiga mental prolongada disminuye la concentración. La técnica Pomodoro combinada con pausas activas de respiración diafragmática ayuda a regular los niveles de cortisol. Si sienten sobrecarga, nuestro consultorio de Bienestar está abierto para agendar su cita individual.',
    fecha_publicacion: new Date(Date.now() - 3600000 * 4).toISOString(),
    id_usuario: 4,
    id_comunidad: 's/CMTC',
    votos: 67,
    comentarios_count: 18,
    comentarios: 18,
    etiqueta: 'Salud Emocional',
    imagen_url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=900&auto=format&fit=crop&q=80',
  },
  {
    id_publicaciones: 2,
    titulo: 'Educación financiera: Cómo presupuestar tus apoyos de sostenimiento FIC y transporte',
    contenido:
      'Organizar tus gastos semanales reduce la ansiedad económica. En esta guía compartimos la regla 50-30-20 adaptada al contexto formativo. Recuerda priorizar alimentación y transporte seguro.',
    fecha_publicacion: new Date(Date.now() - 3600000 * 24).toISOString(),
    id_usuario: 4,
    id_comunidad: 's/CMTC/economia',
    votos: 34,
    comentarios_count: 7,
    comentarios: 7,
    etiqueta: 'Economía',
    imagen_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=900&auto=format&fit=crop&q=80',
  },
  {
    id_publicaciones: 3,
    titulo: 'Pausas activas visuales para programadores y diseñadores del CMTC',
    contenido:
      'La regla 20-20-20: cada 20 minutos de pantalla, mira un punto a 20 pies (6 metros) de distancia durante 20 segundos. ¡Cuida tu postura y tus articulaciones para rendir mejor!',
    fecha_publicacion: new Date(Date.now() - 3600000 * 48).toISOString(),
    id_usuario: 5,
    id_comunidad: 's/CMTC/adso',
    votos: 89,
    comentarios_count: 24,
    comentarios: 24,
    etiqueta: 'Prevención',
    imagen_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=80',
  },
];

const CITAS_SEMILLA: Cita[] = [
  {
    id_cita: 101,
    fecha_hora: new Date(Date.now() + 86400000 * 2).toISOString(),
    motivo: 'Acompañamiento en manejo de ansiedad ante sustentación técnica de proyecto ADSO',
    estado_cita: 'Confirmada',
    id_usuario_aprendiz: 1, // Yonatan
    id_usuario_psicologo: 4, // Dra. Laura
    comentarios_sesion: [
      'Dra. Laura Martínez: Sesión preparatoria programada para calibrar niveles de ansiedad pre-sustentación.',
      'Dra. Laura Martínez: Se solicita traer borrador de diapositivas para ejercicio de simulación de preguntas.',
    ],
  },
  {
    id_cita: 103,
    fecha_hora: new Date(Date.now() - 86400000 * 6).toISOString(),
    motivo: 'Seguimiento psicológico a patrones de sueño y manejo de estrés',
    estado_cita: 'Realizada',
    id_usuario_aprendiz: 1,
    id_usuario_psicologo: 4, // Dra. Laura
    comentarios_sesion: [
      'Dra. Laura Martínez: El aprendiz reporta mejoría moderada. Se instauró técnica de respiración diafragmática 4-7-8.',
      'Dra. Laura Martínez: Disminuyó el consumo de cafeína nocturna. Manifiesta buena receptividad a los ejercicios del Diario reflexivo.',
    ],
  },
  {
    id_cita: 105,
    fecha_hora: new Date(Date.now() - 86400000 * 18).toISOString(),
    motivo: 'Evaluación y tamizaje de hábitos de estudio e integración formativa en el CMTC',
    estado_cita: 'Realizada',
    id_usuario_aprendiz: 1,
    id_usuario_psicologo: 5, // Dr. Carlos Pardo
    comentarios_sesion: [
      'Dr. Carlos Pardo: Tamizaje inicial positivo para estrés académico reactivo. Buena disposición al diálogo.',
      'Dr. Carlos Pardo: Se orienta sobre técnicas pomodoro de estudio y se recomienda canalización con la Dra. Laura para seguimiento continuo.',
    ],
  },
  {
    id_cita: 106,
    fecha_hora: new Date(Date.now() - 86400000 * 32).toISOString(),
    motivo: 'Sesión de acogida y bienvenida al bienestar institucional SENA',
    estado_cita: 'Realizada',
    id_usuario_aprendiz: 1,
    id_usuario_psicologo: 4, // Dra. Laura
    comentarios_sesion: [
      'Dra. Laura Martínez: Apertura formal de expediente de acompañamiento psicológico en el CMTC.',
    ],
  },
  {
    id_cita: 102,
    fecha_hora: new Date(Date.now() + 86400000 * 4).toISOString(),
    motivo: 'Orientación vocacional y plan de transición a etapa productiva',
    estado_cita: 'Pendiente',
    id_usuario_aprendiz: 2, // Josué
    id_usuario_psicologo: 4,
    comentarios_sesion: [
      'Dra. Laura Martínez: Cita agendada para revisión de contrato de aprendizaje y perfil laboral.',
    ],
  },
  {
    id_cita: 104,
    fecha_hora: new Date(Date.now() + 86400000 * 1).toISOString(),
    motivo: 'Seguimiento solicitado por psicólogo para acordar horario conveniente',
    estado_cita: 'Pendiente',
    id_usuario_aprendiz: 3,
    id_usuario_psicologo: 5,
    es_solicitud_sin_agendar: true,
    comentarios_sesion: [
      'Dr. Carlos Pardo: Contacto inicial establecido vía mensajería interna.',
    ],
  },
];

const HISTORIAL_CITAS_SEMILLA: HistorialCita[] = [
  {
    id_h_cita: 1,
    id_cita: 101,
    observaciones_historial: 'Cita solicitada inicialmente por el aprendiz en horario diurno.',
    fecha_cambio: new Date(Date.now() - 86400000 * 1).toISOString(),
    estado_anterior: 'Pendiente',
    estado_nuevo: 'Confirmada',
  },
  {
    id_h_cita: 2,
    id_cita: 103,
    observaciones_historial: 'Sesión completada con éxito. Se acordó plan de respiración y descanso.',
    fecha_cambio: new Date(Date.now() - 86400000 * 5).toISOString(),
    estado_anterior: 'Confirmada',
    estado_nuevo: 'Realizada',
  },
];

const DIARIOS_SEMILLA: Diario[] = [
  {
    id_diario: 1,
    id_usuario: 1,
    titulo: 'Reflexión sobre el avance del sprint',
    contenido:
      'Hoy logramos terminar la arquitectura del microservicio. Al principio me sentí abrumado por las fechas de entrega, pero dividir las tareas con mi compañero me devolvió la calma. Me siento enfocado.',
    fecha_apertura: new Date(Date.now() - 86400000 * 1).toISOString(),
    compartir_sp: 1, // Compartido con Dra. Laura
  },
  {
    id_diario: 2,
    id_usuario: 1,
    titulo: 'Apuntes personales de autocuidado',
    contenido:
      'Nota privada: Recordar no tomar café después de las 6:00 PM. Anoche me costó dormir por estar revisando código hasta tarde.',
    fecha_apertura: new Date(Date.now() - 86400000 * 3).toISOString(),
    compartir_sp: 0, // PRIVADO - No visible para psicólogo
  },
];

const ESTADOS_ANIMO_SEMILLA: EstadoDeAnimo[] = [
  {
    id_estado: 1,
    nombre_estado: 'Feliz',
    fecha_estado: new Date(Date.now() - 86400000 * 4).toISOString(),
    id_usuario: 1,
    centro: 'CMTC',
    avatar_path: '/IMG/cmtc_feliz.svg',
    nota: 'Aprobamos la sustentación de la primera fase.',
    intensidad: 5,
  },
  {
    id_estado: 2,
    nombre_estado: 'Ansioso',
    fecha_estado: new Date(Date.now() - 86400000 * 3).toISOString(),
    id_usuario: 1,
    centro: 'CMTC',
    avatar_path: '/IMG/cmtc_ansioso.svg',
    nota: 'Muchos errores en el pipeline de despliegue.',
    intensidad: 3,
  },
  {
    id_estado: 3,
    nombre_estado: 'Calmado',
    fecha_estado: new Date(Date.now() - 86400000 * 2).toISOString(),
    id_usuario: 1,
    centro: 'CMTC',
    avatar_path: '/IMG/cmtc_calmado.svg',
    nota: 'Dormí 8 horas completas y salí a caminar.',
    intensidad: 4,
  },
  {
    id_estado: 4,
    nombre_estado: 'Motivado',
    fecha_estado: new Date(Date.now() - 86400000 * 1).toISOString(),
    id_usuario: 1,
    centro: 'CMTC',
    avatar_path: '/IMG/cmtc_motivado.svg',
    nota: 'Iniciando el diseño de la interfaz en Figma.',
    intensidad: 5,
  },
  {
    id_estado: 5,
    nombre_estado: 'Calmado',
    fecha_estado: new Date().toISOString(),
    id_usuario: 1,
    centro: 'CMTC',
    avatar_path: '/IMG/cmtc_calmado.svg',
    nota: 'Buen ritmo de trabajo en el taller.',
    intensidad: 4,
  },
];

const FORMULARIOS_SEMILLA: Formulario[] = [
  {
    id_formulario: 1,
    nombre_formulario: 'Tamizaje Emocional y Nivel de Estrés (DASS-21)',
    id_usuario: 4,
    descripcion: 'Instrumento breve de 10 preguntas para evaluar cómo te has sentido en las últimas 2 semanas.',
    preguntas_count: 10,
    tiempo_estimado: '4 minutos',
    id_comunidad: 's/CMTC',
    respondido: false,
  },
  {
    id_formulario: 2,
    nombre_formulario: 'Encuesta de Clima, Respeto y Convivencia SENA CMTC',
    id_usuario: 4,
    descripcion: 'Ayúdanos a mejorar los espacios de formación e inclusión dentro del centro textil.',
    preguntas_count: 8,
    tiempo_estimado: '3 minutos',
    id_comunidad: 's/CMTC',
    respondido: true,
  },
  {
    id_formulario: 3,
    nombre_formulario: 'Diagnóstico de Hábitos de Estudio y Sueño en ADSO',
    id_usuario: 5,
    descripcion: 'Identificación temprana de fatiga visual y hábitos de descanso en aprendices de sistemas.',
    preguntas_count: 6,
    tiempo_estimado: '2 minutos',
    id_comunidad: 's/CMTC/adso',
    respondido: false,
  },
];

const HISTORIAL_CLINICO_SEMILLA: HistorialClinico[] = [
  {
    id_hl_clinico: 1,
    id_usuario: 1, // Yonatan Acuña
    num_ficha: '3288046',
    fecha_apertura: '2026-02-15T09:00:00.000Z',
    condiciones: 'Estrés situacional derivado de carga académica y transición vocacional.',
    condiciones_lista: [
      'Estrés académico reactivo',
      'Fatiga visual por pantallas',
      'Ansiedad ante sustentación ADSO',
    ],
    antecedentes: 'Sin antecedentes psiquiátricos mayores. Buena red de apoyo familiar y escolar.',
    condicion_actual: 'Acompañamiento preventivo activo. Protocolo de autocuidado en curso.',
    evolucion_clinica: 'Evolución favorable con buen compromiso en técnicas de respiración y descanso.',
  },
  {
    id_hl_clinico: 2,
    id_usuario: 2, // Josué Tovar
    num_ficha: '3288046',
    fecha_apertura: '2026-02-20T11:00:00.000Z',
    condiciones: 'Orientación vocacional y adaptación ergonómica en taller textil.',
    condiciones_lista: ['Tensión muscular postural', 'Orientación de perfil laboral'],
    antecedentes: 'Alergias respiratorias estacionales controladas.',
    condicion_actual: 'En proceso de vinculación a etapa productiva.',
    evolucion_clinica: 'Asiste puntualmente a sesiones de orientación.',
  },
  {
    id_hl_clinico: 3,
    id_usuario: 3, // Camila Restrepo
    num_ficha: '3288046',
    fecha_apertura: '2026-02-10T14:30:00.000Z',
    condiciones: 'Monitoreo de estado de ánimo y adherencia terapéutica externa.',
    condiciones_lista: ['Episodio depresivo leve en remisión', 'Acompañamiento en aula'],
    antecedentes: 'Seguimiento por psicología clínica de EPS Compensar.',
    condicion_actual: 'Activa en comunidad SENA, reporte de asistencia regular.',
    evolucion_clinica: 'Participativa en talleres de bienestar.',
  },
];

const SOPORTES_CLINICOS_SEMILLA: CertificadoSoporte[] = [
  {
    id_soporte: 1,
    id_usuario: 1, // Yonatan Acuña
    nombre_documento: 'Certificado de Incapacidad Médica (3 Días)',
    entidad: 'EPS Sanitas - Centro Médico Restrepo',
    fecha_emision: '2026-02-28',
    medico_especialista: 'Dra. Patricia Gómez (Medicina General R.M. 34211)',
    tipo_archivo: 'PDF',
    tamano: '1.2 MB',
    observaciones: 'Reposo médico justificado por cuadro agudo de cefalea tensional y fatiga.',
    diagnostico_cie10: 'G44.2 Cefalea tensional',
  },
  {
    id_soporte: 2,
    id_usuario: 1, // Yonatan Acuña
    nombre_documento: 'Concepto de Acompañamiento Psicológico Externo',
    entidad: 'Compensar EPS - Sede Calle 26',
    fecha_emision: '2026-02-10',
    medico_especialista: 'Dr. Fernando Salazar (Psicología Clínica TP 108422)',
    tipo_archivo: 'PDF',
    tamano: '840 KB',
    observaciones: 'Se sugiere flexibilidad en tiempos de evaluación formativa y pausas activas.',
    diagnostico_cie10: 'F41.2 Trastorno mixto ansioso-depresivo',
  },
  {
    id_soporte: 3,
    id_usuario: 1, // Yonatan Acuña
    nombre_documento: 'Constancia de Atención Consulta Prioritaria',
    entidad: 'Subred Integrada de Servicios de Salud Centro Oriente',
    fecha_emision: '2026-01-20',
    medico_especialista: 'Dra. Marcela Rincón (Urgencias Médicas)',
    tipo_archivo: 'PDF',
    tamano: '620 KB',
    observaciones: 'Atención por crisis de pánico situacional; remitido a Bienestar SENA.',
    diagnostico_cie10: 'F41.0 Trastorno de pánico',
  },
  {
    id_soporte: 4,
    id_usuario: 2, // Josué Tovar
    nombre_documento: 'Certificado Médico de Aptitud Física y Ocupacional',
    entidad: 'SURA EPS - Sede Paloquemao',
    fecha_emision: '2026-01-15',
    medico_especialista: 'Dr. Camilo Echeverry (Salud Ocupacional)',
    tipo_archivo: 'PDF',
    tamano: '950 KB',
    observaciones: 'Apto para talleres de maquinaria textil con recomendaciones posturales.',
  },
  {
    id_soporte: 5,
    id_usuario: 3, // Camila Restrepo
    nombre_documento: 'Remisión de Consulta Psiquiátrica y Acompañamiento',
    entidad: 'Clínica Nuestra Señora de la Paz',
    fecha_emision: '2026-02-02',
    medico_especialista: 'Dra. Claudia Ortiz (Psiquiatría de Enlace)',
    tipo_archivo: 'PDF',
    tamano: '1.5 MB',
    observaciones: 'Monitoreo de adherencia farmacológica y contención en aula formativa.',
    diagnostico_cie10: 'F32.1 Episodio depresivo moderado',
  },
];

const ANOTACIONES_CLINICAS_SEMILLA: AnotacionClinica[] = [
  {
    id_anotacion: 1,
    id_usuario_aprendiz: 1,
    id_usuario_psicologo: 4,
    nombre_psicologo: 'Dra. Laura Martínez',
    fecha: '2026-03-05T10:30:00.000Z',
    tipo: 'Evolución',
    contenido: 'Aprendiz asiste a sesión de seguimiento. Refiere mejor manejo de la presión ante los entregables del instructor técnico de ADSO. Se acordó continuar con el diario reflexivo como herramienta de desahogo y anclaje.',
  },
  {
    id_anotacion: 2,
    id_usuario_aprendiz: 1,
    id_usuario_psicologo: 4,
    nombre_psicologo: 'Dra. Laura Martínez',
    fecha: '2026-02-20T14:15:00.000Z',
    tipo: 'Acuerdo',
    contenido: 'Se coordina con el comité pedagógico de ADSO para brindar acompañamiento en las pruebas de software sin generar sobrecarga. Se valida soporte médico de EPS Sanitas.',
  },
  {
    id_anotacion: 3,
    id_usuario_aprendiz: 1,
    id_usuario_psicologo: 5,
    nombre_psicologo: 'Dr. Carlos Pardo',
    fecha: '2026-02-12T11:00:00.000Z',
    tipo: 'Comentario',
    contenido: 'Sesión de orientación vocacional previa. Buen nivel de compromiso, introspectivo y receptivo a sugerencias de higiene del sueño.',
  },
];

const VOTOS_USUARIOS_SEMILLA: VotoUsuario[] = [
  {
    id_voto: 1,
    id_usuario: 1, // Yonatan Acuña
    id_publicacion: 1, // Estrategias manejo de estrés
    tipo: 'upvote',
    fecha: '2026-03-09T14:20:00.000Z',
  },
  {
    id_voto: 2,
    id_usuario: 1, // Yonatan Acuña
    id_publicacion: 3, // Pausas activas ADSO
    tipo: 'upvote',
    fecha: '2026-03-08T09:15:00.000Z',
  },
  {
    id_voto: 3,
    id_usuario: 1, // Yonatan Acuña
    id_publicacion: 2, // Educación financiera
    tipo: 'downvote',
    fecha: '2026-03-07T16:45:00.000Z',
  },
  {
    id_voto: 4,
    id_usuario: 2, // Josué Tovar
    id_publicacion: 2,
    tipo: 'upvote',
    fecha: '2026-03-10T11:00:00.000Z',
  },
  {
    id_voto: 5,
    id_usuario: 2, // Josué Tovar
    id_publicacion: 1,
    tipo: 'downvote',
    fecha: '2026-03-09T17:30:00.000Z',
  },
  {
    id_voto: 6,
    id_usuario: 3, // Camila Restrepo
    id_publicacion: 1,
    tipo: 'upvote',
    fecha: '2026-03-10T08:20:00.000Z',
  },
  {
    id_voto: 7,
    id_usuario: 3, // Camila Restrepo
    id_publicacion: 2,
    tipo: 'upvote',
    fecha: '2026-03-09T13:40:00.000Z',
  },
];

const EMERGENCIAS_SEMILLA: Emergencia[] = [
  {
    id_emergencia: 1,
    id_usuario: 1,
    fecha_emergencia: new Date(Date.now() - 86400000 * 10).toISOString(),
    descripcion: 'Activación preventiva de botón de pánico en jornada nocturna.',
    estado: 'Atendida',
  },
];

const MENUS_SEMILLA: Menu[] = [
  // SECCION 1 (Aprendiz)
  { id_menu: 1, nombre_menu: 'Home', nombre_menu_en: 'Home', icono: 'Home', ruta: 'home', seccion: 1, orden: 1 },
  { id_menu: 2, nombre_menu: 'Diario', nombre_menu_en: 'Journal', icono: 'BookOpen', ruta: 'diario', seccion: 1, orden: 2 },
  { id_menu: 3, nombre_menu: 'Formulario', nombre_menu_en: 'Forms', icono: 'ClipboardList', ruta: 'formularios', seccion: 1, orden: 3 },
  { id_menu: 4, nombre_menu: 'Explorar', nombre_menu_en: 'Explore', icono: 'Compass', ruta: 'explorar', seccion: 1, orden: 4 },
  { id_menu: 5, nombre_menu: 'Cita', nombre_menu_en: 'Appointment', icono: 'CalendarPlus', ruta: 'citas', seccion: 1, orden: 5, es_accion: true },

  // SECCION 1 (Psicólogo)
  { id_menu: 6, nombre_menu: 'Crear Publicación', nombre_menu_en: 'New Post', icono: 'PlusCircle', ruta: 'crear_publicacion', seccion: 1, orden: 3, es_accion: true },

  // SECCION 2: Custom Feeds (Aprendiz) / Formulario (Psicólogo)
  { id_menu: 7, nombre_menu: 'Custom Feeds', nombre_menu_en: 'Custom Feeds', icono: 'Layers', ruta: 'custom_feeds', seccion: 2, orden: 1 },
  { id_menu: 8, nombre_menu: 'Create Custom', nombre_menu_en: 'Create Custom', icono: 'Plus', ruta: 'crear_custom_feed', seccion: 2, orden: 2, es_accion: true },
  { id_menu: 9, nombre_menu: 'Subir Formulario', nombre_menu_en: 'Upload Form', icono: 'FileUp', ruta: 'subir_formulario', seccion: 2, orden: 2, es_accion: true },

  // SECCION 3: Community (Aprendiz) / Reportes (Psicólogo)
  { id_menu: 10, nombre_menu: 'Comunidades', nombre_menu_en: 'Communities', icono: 'Users', ruta: 'comunidades', seccion: 3, orden: 1 },
  { id_menu: 11, nombre_menu: 'Reportes', nombre_menu_en: 'Reports', icono: 'BarChart2', ruta: 'reportes', seccion: 3, orden: 1 },
  { id_menu: 12, nombre_menu: 'Crear Reportes', nombre_menu_en: 'Create Report', icono: 'FileSpreadsheet', ruta: 'crear_reporte', seccion: 3, orden: 2, es_accion: true },

  // SECCION 4: Recursos (Aprendiz) / Comunidades (Psicólogo)
  { id_menu: 13, nombre_menu: 'About Serena', nombre_menu_en: 'About Serena', icono: 'Info', ruta: 'recursos_about', seccion: 4, orden: 1 },
  { id_menu: 14, nombre_menu: 'Help', nombre_menu_en: 'Help', icono: 'HelpCircle', ruta: 'recursos_help', seccion: 4, orden: 2 },
  { id_menu: 15, nombre_menu: 'Blog', nombre_menu_en: 'Blog', icono: 'BookText', ruta: 'recursos_blog', seccion: 4, orden: 3 },
];

const MENU_ROL_SEMILLA: MenuRol[] = [
  // Aprendiz (id_rol = 1)
  // Sección 1: Home, Diario, Formulario, Explorar, + Cita
  { id_menu_rol: 1, id_rol: 1, id_menu: 1 },
  { id_menu_rol: 2, id_rol: 1, id_menu: 2 },
  { id_menu_rol: 3, id_rol: 1, id_menu: 3 },
  { id_menu_rol: 4, id_rol: 1, id_menu: 4 },
  { id_menu_rol: 5, id_rol: 1, id_menu: 5 },
  // Sección 2: Custom Feeds, + Create Custom
  { id_menu_rol: 6, id_rol: 1, id_menu: 7 },
  { id_menu_rol: 7, id_rol: 1, id_menu: 8 },
  // Sección 3: Community
  { id_menu_rol: 8, id_rol: 1, id_menu: 10 },
  // Sección 4: Recursos
  { id_menu_rol: 9, id_rol: 1, id_menu: 13 },
  { id_menu_rol: 10, id_rol: 1, id_menu: 14 },
  { id_menu_rol: 11, id_rol: 1, id_menu: 15 },

  // Psicólogo (id_rol = 2)
  // Sección 1: Home, Explorar, + Crear Publicación
  { id_menu_rol: 12, id_rol: 2, id_menu: 1 },
  { id_menu_rol: 13, id_rol: 2, id_menu: 4 },
  { id_menu_rol: 14, id_rol: 2, id_menu: 6 },
  // Sección 2: Formulario, + Subir Formulario
  { id_menu_rol: 15, id_rol: 2, id_menu: 3 },
  { id_menu_rol: 16, id_rol: 2, id_menu: 9 },
  // Sección 3: Reportes, + Crear Reportes
  { id_menu_rol: 17, id_rol: 2, id_menu: 11 },
  { id_menu_rol: 18, id_rol: 2, id_menu: 12 },
  // Sección 4: Comunidades
  { id_menu_rol: 19, id_rol: 2, id_menu: 10 },
  // Sección 5: Recursos (About Serena, Blog, Help)
  { id_menu_rol: 20, id_rol: 2, id_menu: 13 },
  { id_menu_rol: 21, id_rol: 2, id_menu: 15 },
  { id_menu_rol: 22, id_rol: 2, id_menu: 14 },
];

const CUSTOM_FEEDS_SEMILLA: CustomFeed[] = [
  {
    id: 'feed-ansiedad-calma',
    nombre: 'Ansiedad & Calma',
    icono: 'Sparkles',
    descripcion: 'Píldoras y respiración guiada del CMTC',
    comunidades: ['s/CMTC', 's/CMTC/salud-mental'],
  },
  {
    id: 'feed-adso-productividad',
    nombre: 'ADSO & Productividad',
    icono: 'Code',
    descripcion: 'Prevención de burnout en programación',
    comunidades: ['s/CMTC/adso', 's/CMTC'],
  },
];

class SerenaApiService {
  private isConfiguredForRealBackend: boolean = false;
  private backendBaseUrl: string = 'http://localhost:5000/api';

  constructor() {
    this.initStorage();
  }

  private initStorage() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEYS.USUARIOS)) {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(USUARIOS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMUNIDADES)) {
      localStorage.setItem(STORAGE_KEYS.COMUNIDADES, JSON.stringify(COMUNIDADES_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PUBLICACIONES)) {
      localStorage.setItem(STORAGE_KEYS.PUBLICACIONES, JSON.stringify(PUBLICACIONES_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CITAS)) {
      localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(CITAS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORIAL_CITAS)) {
      localStorage.setItem(STORAGE_KEYS.HISTORIAL_CITAS, JSON.stringify(HISTORIAL_CITAS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.DIARIO)) {
      localStorage.setItem(STORAGE_KEYS.DIARIO, JSON.stringify(DIARIOS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ESTADO_ANIMO)) {
      localStorage.setItem(STORAGE_KEYS.ESTADO_ANIMO, JSON.stringify(ESTADOS_ANIMO_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FORMULARIOS)) {
      localStorage.setItem(STORAGE_KEYS.FORMULARIOS, JSON.stringify(FORMULARIOS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.HISTORIAL_CLINICO)) {
      localStorage.setItem(STORAGE_KEYS.HISTORIAL_CLINICO, JSON.stringify(HISTORIAL_CLINICO_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EMERGENCIAS)) {
      localStorage.setItem(STORAGE_KEYS.EMERGENCIAS, JSON.stringify(EMERGENCIAS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENUS)) {
      localStorage.setItem(STORAGE_KEYS.MENUS, JSON.stringify(MENUS_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MENU_ROL)) {
      localStorage.setItem(STORAGE_KEYS.MENU_ROL, JSON.stringify(MENU_ROL_SEMILLA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CUSTOM_FEEDS)) {
      localStorage.setItem(STORAGE_KEYS.CUSTOM_FEEDS, JSON.stringify(CUSTOM_FEEDS_SEMILLA));
    }
  }

  // --- Usuarios & Autenticación ---
  public getUsuarios(): Usuario[] {
    const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
    return data ? JSON.parse(data) : USUARIOS_SEMILLA;
  }

  public getCurrentUser(): Usuario {
    const saved = localStorage.getItem('serena_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return this.getUsuarios()[0]; // Default: Yonatan Acuña (Aprendiz CMTC)
  }

  public setCurrentUser(user: Usuario): void {
    localStorage.setItem('serena_current_user', JSON.stringify(user));
  }

  public getUsuarioById(id: number): Usuario | undefined {
    return this.getUsuarios().find((u) => u.id_usuario === id);
  }

  public getPsicologosPorCentro(centro: string): Usuario[] {
    return this.getUsuarios().filter((u) => u.id_rol === 2 && u.centro === centro);
  }

  // --- Comunidades ---
  public getComunidades(): Comunidad[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMUNIDADES);
    return data ? JSON.parse(data) : COMUNIDADES_SEMILLA;
  }

  public getComunidadesPorCentro(centro: string): Comunidad[] {
    return this.getComunidades().filter((c) => c.centro === centro);
  }

  public crearSubComunidad(subNombre: string, descripcion: string, funcionario: Usuario): Comunidad {
    const slug = subNombre.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    const id = `s/${funcionario.centro}/${slug}`;
    const nueva: Comunidad = {
      id,
      centro: funcionario.centro,
      sub_nombre: subNombre,
      nombre_completo: `s/${funcionario.centro}/${slug} - ${subNombre}`,
      descripcion,
      icono: 'Compass',
      es_oficial: false,
      creado_por_id: funcionario.id_usuario,
    };
    const lista = this.getComunidades();
    lista.push(nueva);
    localStorage.setItem(STORAGE_KEYS.COMUNIDADES, JSON.stringify(lista));
    return nueva;
  }

  public getIntegrantesComunidad(comunidadId: string): Usuario[] {
    // Regla de Negocio: En la comunidad sólo se visualizan los funcionarios/psicólogos en tarjeta
    const com = this.getComunidades().find((c) => c.id === comunidadId);
    const centro = com ? com.centro : 'CMTC';
    return this.getUsuarios().filter((u) => (u.id_rol === 2 || u.id_rol === 3) && u.centro === centro);
  }

  // --- Publicaciones (Feed) ---
  public getPublicaciones(comunidadId?: string): Publicacion[] {
    const data = localStorage.getItem(STORAGE_KEYS.PUBLICACIONES);
    const lista: Publicacion[] = data ? JSON.parse(data) : PUBLICACIONES_SEMILLA;
    const usuarios = this.getUsuarios();

    const conAutor = lista.map((p) => ({
      ...p,
      autor: usuarios.find((u) => u.id_usuario === p.id_usuario),
    }));

    if (comunidadId) {
      return conAutor.filter((p) => p.id_comunidad === comunidadId);
    }
    return conAutor.sort((a, b) => new Date(b.fecha_publicacion).getTime() - new Date(a.fecha_publicacion).getTime());
  }

  public getPublicacionesPorAutor(id_usuario: number): Publicacion[] {
    return this.getPublicaciones().filter((p) => p.id_usuario === id_usuario);
  }

  public crearPublicacion(titulo: string, contenido: string, id_usuario: number, id_comunidad: string, etiqueta?: string): Publicacion {
    const lista = this.getPublicaciones();
    const nueva: Publicacion = {
      id_publicaciones: Date.now(),
      titulo,
      contenido,
      fecha_publicacion: new Date().toISOString(),
      id_usuario,
      id_comunidad,
      votos: 1,
      comentarios_count: 0,
      etiqueta: etiqueta || 'Bienestar',
    };
    lista.unshift(nueva);
    localStorage.setItem(STORAGE_KEYS.PUBLICACIONES, JSON.stringify(lista));
    return nueva;
  }

  public votarPublicacion(id_publicacion: number, delta: number, id_usuario?: number): void {
    const lista = this.getPublicaciones();
    const p = lista.find((item) => item.id_publicaciones === id_publicacion);
    if (p) {
      p.votos = (p.votos || 0) + delta;
      localStorage.setItem(STORAGE_KEYS.PUBLICACIONES, JSON.stringify(lista));
    }

    if (id_usuario) {
      const votosRaw = localStorage.getItem(STORAGE_KEYS.VOTOS_USUARIOS);
      const listaVotos: VotoUsuario[] = votosRaw ? JSON.parse(votosRaw) : VOTOS_USUARIOS_SEMILLA;
      const idx = listaVotos.findIndex(
        (v) => v.id_usuario === id_usuario && v.id_publicacion === id_publicacion
      );

      const tipo: 'upvote' | 'downvote' = delta > 0 ? 'upvote' : 'downvote';

      if (idx >= 0) {
        if (delta === 0) {
          listaVotos.splice(idx, 1);
        } else {
          listaVotos[idx].tipo = tipo;
          listaVotos[idx].fecha = new Date().toISOString();
        }
      } else if (delta !== 0) {
        listaVotos.unshift({
          id_voto: Date.now(),
          id_usuario,
          id_publicacion,
          tipo,
          fecha: new Date().toISOString(),
        });
      }
      localStorage.setItem(STORAGE_KEYS.VOTOS_USUARIOS, JSON.stringify(listaVotos));
    }
  }

  public getVotosUsuario(id_usuario: number): { upvotes: Publicacion[]; downvotes: Publicacion[] } {
    const votosRaw = localStorage.getItem(STORAGE_KEYS.VOTOS_USUARIOS);
    const listaVotos: VotoUsuario[] = votosRaw ? JSON.parse(votosRaw) : VOTOS_USUARIOS_SEMILLA;
    const publicaciones = this.getPublicaciones();

    const misVotos = listaVotos.filter((v) => v.id_usuario === id_usuario);
    const upvoteIds = new Set(misVotos.filter((v) => v.tipo === 'upvote').map((v) => v.id_publicacion));
    const downvoteIds = new Set(misVotos.filter((v) => v.tipo === 'downvote').map((v) => v.id_publicacion));

    const upvotes = publicaciones.filter((p) => upvoteIds.has(p.id_publicaciones));
    const downvotes = publicaciones.filter((p) => downvoteIds.has(p.id_publicaciones));

    return { upvotes, downvotes };
  }

  // --- Citas (Módulo de Citas y Trazabilidad) ---
  public getCitas(usuario?: Usuario): Cita[] {
    const data = localStorage.getItem(STORAGE_KEYS.CITAS);
    const lista: Cita[] = data ? JSON.parse(data) : CITAS_SEMILLA;
    const usuarios = this.getUsuarios();

    const enriquecidas = lista.map((c) => ({
      ...c,
      aprendiz: usuarios.find((u) => u.id_usuario === c.id_usuario_aprendiz),
      psicologo: usuarios.find((u) => u.id_usuario === c.id_usuario_psicologo),
    }));

    if (usuario) {
      if (usuario.id_rol === 1) {
        // Aprendiz solo ve sus citas (RN-03)
        return enriquecidas.filter((c) => c.id_usuario_aprendiz === usuario.id_usuario);
      } else if (usuario.id_rol === 2) {
        // Psicólogo ve citas asignadas a él
        return enriquecidas.filter((c) => c.id_usuario_psicologo === usuario.id_usuario);
      }
    }
    return enriquecidas;
  }

  public agendarCita(id_aprendiz: number, id_psicologo: number, fecha_hora: string, motivo: string): Cita {
    const lista: Cita[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CITAS) || '[]');
    const nuevaCita: Cita = {
      id_cita: Date.now(),
      fecha_hora,
      motivo,
      estado_cita: 'Pendiente',
      id_usuario_aprendiz: id_aprendiz,
      id_usuario_psicologo: id_psicologo,
    };
    lista.unshift(nuevaCita);
    localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(lista));

    // Auditoría inmutable en historial_cita (RN-04)
    this.registrarHistorialCita(nuevaCita.id_cita, 'Creación de cita por el aprendiz en estado Pendiente.');
    return nuevaCita;
  }

  public solicitarCitaSinAgendar(id_psicologo: number, id_aprendiz: number, motivo: string): Cita {
    const lista: Cita[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CITAS) || '[]');
    const nueva: Cita = {
      id_cita: Date.now(),
      fecha_hora: new Date(Date.now() + 86400000 * 2).toISOString(),
      motivo: motivo || 'Solicitud de acompañamiento psicológico enviada por tu psicólogo asignado.',
      estado_cita: 'Pendiente',
      id_usuario_aprendiz: id_aprendiz,
      id_usuario_psicologo: id_psicologo,
      es_solicitud_sin_agendar: true,
    };
    lista.unshift(nueva);
    localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(lista));
    this.registrarHistorialCita(nueva.id_cita, 'Solicitud de cita emitida por psicólogo sin franja fija.');
    return nueva;
  }

  public actualizarEstadoCita(
    id_cita: number,
    nuevoEstado: 'Pendiente' | 'Confirmada' | 'Realizada' | 'Cancelada',
    observacion: string
  ): void {
    const lista: Cita[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.CITAS) || '[]');
    const cita = lista.find((c) => c.id_cita === id_cita);
    if (cita) {
      const estadoAnterior = cita.estado_cita;
      cita.estado_cita = nuevoEstado;
      cita.es_solicitud_sin_agendar = false;
      localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(lista));

      // Disparador de auditoría inmutable en historial_cita (RF-CIT-02 y RN-04)
      this.registrarHistorialCita(
        id_cita,
        `Cambio de estado: de [${estadoAnterior}] a [${nuevoEstado}]. Observación: ${observacion}`
      );
    }
  }

  private registrarHistorialCita(id_cita: number, observacion: string) {
    const historial: HistorialCita[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CITAS) || '[]');
    historial.push({
      id_h_cita: Date.now() + Math.floor(Math.random() * 1000),
      id_cita,
      observaciones_historial: observacion,
      fecha_cambio: new Date().toISOString(),
    });
    localStorage.setItem(STORAGE_KEYS.HISTORIAL_CITAS, JSON.stringify(historial));
  }

  public getHistorialCita(id_cita: number): HistorialCita[] {
    const historial: HistorialCita[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CITAS) || '[]');
    return historial.filter((h) => h.id_cita === id_cita);
  }

  // --- Historial Clínico (RF-HC-01, RF-HC-02, RN-01) ---
  public getHistorialClinico(id_usuario_aprendiz: number, rol_solicitante: number): HistorialClinico | undefined {
    if (rol_solicitante === 1) {
      // RN-01: Prohibido para rol Aprendiz (403 Forbidden)
      throw new Error('403 Forbidden: Los aprendices no tienen acceso a expedientes clínicos.');
    }
    const lista: HistorialClinico[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CLINICO) || '[]');
    return lista.find((h) => h.id_usuario === id_usuario_aprendiz);
  }

  public getHistoriaClinica(id_usuario_aprendiz: number, rol_solicitante: number): HistorialClinico | undefined {
    return this.getHistorialClinico(id_usuario_aprendiz, rol_solicitante);
  }

  public guardarHistorialClinico(expediente: HistorialClinico, rol_solicitante: number): void {
    if (rol_solicitante !== 2 && rol_solicitante !== 3) {
      throw new Error('403 Forbidden');
    }
    const lista: HistorialClinico[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CLINICO) || '[]');
    const idx = lista.findIndex((h) => h.id_usuario === expediente.id_usuario);
    if (idx >= 0) {
      lista[idx] = expediente;
    } else {
      lista.push(expediente);
    }
    localStorage.setItem(STORAGE_KEYS.HISTORIAL_CLINICO, JSON.stringify(lista));
  }

  public actualizarHistoriaClinica(id_usuario: number, condicion: string, evolucion: string): HistorialClinico {
    const lista: HistorialClinico[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CLINICO) || '[]');
    let item = lista.find((h) => h.id_usuario === id_usuario);
    if (!item) {
      item = {
        id_hl_clinico: Date.now(),
        id_usuario,
        num_ficha: '3288046',
        fecha_apertura: new Date().toISOString(),
        condiciones: condicion,
        condicion_actual: condicion,
        antecedentes: 'Registro inicial',
        evolucion_clinica: evolucion,
      };
      lista.push(item);
    } else {
      item.condiciones = condicion;
      item.condicion_actual = condicion;
      item.evolucion_clinica = evolucion;
    }
    localStorage.setItem(STORAGE_KEYS.HISTORIAL_CLINICO, JSON.stringify(lista));
    return item;
  }

  // --- Soportes Clínicos y Certificados Médicos Externos ---
  public getSoportesClinicos(id_usuario: number): CertificadoSoporte[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SOPORTES_CLINICOS);
    const lista: CertificadoSoporte[] = raw ? JSON.parse(raw) : SOPORTES_CLINICOS_SEMILLA;
    return lista.filter((s) => s.id_usuario === id_usuario);
  }

  public agregarSoporteClinico(soporte: Omit<CertificadoSoporte, 'id_soporte'>): CertificadoSoporte {
    const raw = localStorage.getItem(STORAGE_KEYS.SOPORTES_CLINICOS);
    const lista: CertificadoSoporte[] = raw ? JSON.parse(raw) : [...SOPORTES_CLINICOS_SEMILLA];
    const nuevo: CertificadoSoporte = {
      ...soporte,
      id_soporte: Date.now(),
    };
    lista.unshift(nuevo);
    localStorage.setItem(STORAGE_KEYS.SOPORTES_CLINICOS, JSON.stringify(lista));
    return nuevo;
  }

  // --- Anotaciones Clínicas y Comentarios del Psicólogo ---
  public getAnotacionesClinicas(id_usuario: number): AnotacionClinica[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ANOTACIONES_CLINICAS);
    const lista: AnotacionClinica[] = raw ? JSON.parse(raw) : ANOTACIONES_CLINICAS_SEMILLA;
    return lista
      .filter((a) => a.id_usuario_aprendiz === id_usuario)
      .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
  }

  public agregarAnotacionClinica(
    id_usuario_aprendiz: number,
    id_usuario_psicologo: number,
    nombre_psicologo: string,
    tipo: 'Evolución' | 'Comentario' | 'Condición' | 'Acuerdo',
    contenido: string
  ): AnotacionClinica {
    const raw = localStorage.getItem(STORAGE_KEYS.ANOTACIONES_CLINICAS);
    const lista: AnotacionClinica[] = raw ? JSON.parse(raw) : [...ANOTACIONES_CLINICAS_SEMILLA];
    const nueva: AnotacionClinica = {
      id_anotacion: Date.now(),
      id_usuario_aprendiz,
      id_usuario_psicologo,
      nombre_psicologo,
      fecha: new Date().toISOString(),
      tipo,
      contenido,
    };
    lista.unshift(nueva);
    localStorage.setItem(STORAGE_KEYS.ANOTACIONES_CLINICAS, JSON.stringify(lista));
    return nueva;
  }

  public agregarCondicion(id_usuario: number, condicion: string): string[] {
    const lista: HistorialClinico[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CLINICO) || '[]');
    let item = lista.find((h) => h.id_usuario === id_usuario);
    if (!item) {
      item = {
        id_hl_clinico: Date.now(),
        id_usuario,
        num_ficha: '3288046',
        fecha_apertura: new Date().toISOString(),
        condiciones: condicion,
        condiciones_lista: [condicion],
        antecedentes: 'Registro inicial',
      };
      lista.push(item);
    } else {
      if (!item.condiciones_lista) {
        item.condiciones_lista = item.condiciones ? item.condiciones.split(',').map((s) => s.trim()) : [];
      }
      if (!item.condiciones_lista.includes(condicion)) {
        item.condiciones_lista.push(condicion);
        item.condiciones = item.condiciones_lista.join(', ');
      }
    }
    localStorage.setItem(STORAGE_KEYS.HISTORIAL_CLINICO, JSON.stringify(lista));
    return item.condiciones_lista || [];
  }

  public eliminarCondicion(id_usuario: number, condicion: string): string[] {
    const lista: HistorialClinico[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.HISTORIAL_CLINICO) || '[]');
    const item = lista.find((h) => h.id_usuario === id_usuario);
    if (item && item.condiciones_lista) {
      item.condiciones_lista = item.condiciones_lista.filter((c) => c !== condicion);
      item.condiciones = item.condiciones_lista.join(', ');
      localStorage.setItem(STORAGE_KEYS.HISTORIAL_CLINICO, JSON.stringify(lista));
      return item.condiciones_lista;
    }
    return [];
  }

  public agregarComentarioCita(id_cita: number, comentario: string, nombre_psicologo: string): void {
    const data = localStorage.getItem(STORAGE_KEYS.CITAS);
    const lista: Cita[] = data ? JSON.parse(data) : [...CITAS_SEMILLA];
    const cita = lista.find((c) => c.id_cita === id_cita);
    if (cita) {
      if (!cita.comentarios_sesion) {
        cita.comentarios_sesion = [];
      }
      const fechaCorta = new Date().toLocaleDateString('es-CO', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });
      cita.comentarios_sesion.push(`${nombre_psicologo} (${fechaCorta}): ${comentario}`);
      localStorage.setItem(STORAGE_KEYS.CITAS, JSON.stringify(lista));

      // Registrar auditoría en el historial
      this.registrarHistorialCita(
        id_cita,
        `Comentario añadido por ${nombre_psicologo}: "${comentario.slice(0, 40)}..."`
      );
    }
  }

  // --- Diario Personal con Cifrado AES (RF-DIA-01 a 03, RN-02) ---
  public getDiario(id_usuario_aprendiz: number, rol_solicitante: number, id_usuario_solicitante: number): Diario[] {
    const data: Diario[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIARIO) || '[]');
    if (rol_solicitante === 1) {
      // El aprendiz solo ve su propio diario (RN-03)
      return data.filter((d) => d.id_usuario === id_usuario_solicitante);
    } else if (rol_solicitante === 2) {
      // RN-02: El psicólogo SOLO recibe registros donde compartir_sp === 1
      return data.filter((d) => d.id_usuario === id_usuario_aprendiz && d.compartir_sp === 1);
    }
    return [];
  }

  public guardarEntradaDiario(id_usuario: number, titulo: string, contenido: string, compartir_sp: number): Diario {
    const data: Diario[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIARIO) || '[]');
    const nuevaEntrada: Diario = {
      id_diario: Date.now(),
      id_usuario,
      titulo,
      contenido, // Simulación de cifrado AES-256 en reposo
      fecha_apertura: new Date().toISOString(),
      compartir_sp,
    };
    data.unshift(nuevaEntrada);
    localStorage.setItem(STORAGE_KEYS.DIARIO, JSON.stringify(data));
    return nuevaEntrada;
  }

  public cambiarPermisoCompartirDiario(id_diario: number, nuevoCompartir: number): void {
    const data: Diario[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DIARIO) || '[]');
    const entrada = data.find((d) => d.id_diario === id_diario);
    if (entrada) {
      entrada.compartir_sp = nuevoCompartir;
      localStorage.setItem(STORAGE_KEYS.DIARIO, JSON.stringify(data));
    }
  }

  // --- Estado de Ánimo (RF-EA-01, RF-EA-02) ---
  public getEstadosDeAnimo(id_usuario: number): EstadoDeAnimo[] {
    const data: EstadoDeAnimo[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ESTADO_ANIMO) || '[]');
    return data
      .filter((e) => e.id_usuario === id_usuario)
      .sort((a, b) => new Date(a.fecha_estado).getTime() - new Date(b.fecha_estado).getTime());
  }

  public getHistorialEstados(id_usuario: number): EstadoDeAnimo[] {
    return this.getEstadosDeAnimo(id_usuario);
  }

  public registrarEstadoDeAnimo(
    id_usuario: number,
    nombre_estado: 'Feliz' | 'Calmado' | 'Ansioso' | 'Triste' | 'Motivado',
    centro: 'CMTC' | 'CMM' | 'CEET',
    avatar_path: string,
    nota?: string,
    intensidad: number = 4
  ): EstadoDeAnimo {
    const data: EstadoDeAnimo[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.ESTADO_ANIMO) || '[]');
    const nuevo: EstadoDeAnimo = {
      id_estado: Date.now(),
      id_usuario,
      nombre_estado,
      fecha_estado: new Date().toISOString(),
      centro,
      avatar_path,
      nota,
      intensidad,
    };
    data.push(nuevo);
    localStorage.setItem(STORAGE_KEYS.ESTADO_ANIMO, JSON.stringify(data));
    return nuevo;
  }

  // --- Emergencias (RF-EM-01, RN-05) ---
  public registrarEmergencia(id_usuario: number, descripcion?: string): Emergencia {
    const data: Emergencia[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMERGENCIAS) || '[]');
    const nueva: Emergencia = {
      id_emergencia: Date.now(),
      id_usuario,
      fecha_emergencia: new Date().toISOString(),
      descripcion: descripcion || 'Activación inmediata del botón de pánico desde la aplicación web.',
      estado: 'Registrada',
    };
    // RN-05: Inmutable, sirve como evidencia auditada de apoyo
    data.unshift(nueva);
    localStorage.setItem(STORAGE_KEYS.EMERGENCIAS, JSON.stringify(data));
    return nueva;
  }

  public getEmergencias(): Emergencia[] {
    const data: Emergencia[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMERGENCIAS) || '[]');
    const usuarios = this.getUsuarios();
    return data.map((e) => ({
      ...e,
      usuario: usuarios.find((u) => u.id_usuario === e.id_usuario),
    }));
  }

  // --- Formularios (RF-FOR-01) ---
  public getFormularios(): Formulario[] {
    const data = localStorage.getItem(STORAGE_KEYS.FORMULARIOS);
    return data ? JSON.parse(data) : FORMULARIOS_SEMILLA;
  }

  public crearFormulario(nombre: string, descripcion: string, id_usuario: number, preguntasCount: number = 5, comunidadId?: string): Formulario {
    const data = this.getFormularios();
    const nuevo: Formulario = {
      id_formulario: Date.now(),
      nombre_formulario: nombre,
      id_usuario,
      descripcion,
      preguntas_count: preguntasCount,
      tiempo_estimado: `${Math.max(2, Math.round(preguntasCount * 0.5))} minutos`,
      id_comunidad: comunidadId || 's/CMTC',
      respondido: false,
    };
    data.unshift(nuevo);
    localStorage.setItem(STORAGE_KEYS.FORMULARIOS, JSON.stringify(data));
    return nuevo;
  }

  public responderFormulario(id_formulario: number): void {
    const data = this.getFormularios();
    const item = data.find((f) => f.id_formulario === id_formulario);
    if (item) {
      item.respondido = true;
      localStorage.setItem(STORAGE_KEYS.FORMULARIOS, JSON.stringify(data));
    }
  }

  // --- Menús y Roles (SRS IEEE 830 - Tablas Menu y Menu_Rol) ---
  public getMenusPorRol(id_rol: number): Menu[] {
    const rawMenus = localStorage.getItem(STORAGE_KEYS.MENUS);
    const rawMenuRol = localStorage.getItem(STORAGE_KEYS.MENU_ROL);

    const menus: Menu[] = rawMenus ? JSON.parse(rawMenus) : MENUS_SEMILLA;
    const menuRoles: MenuRol[] = rawMenuRol ? JSON.parse(rawMenuRol) : MENU_ROL_SEMILLA;

    const idsPermitidos = new Set(
      menuRoles.filter((mr) => mr.id_rol === id_rol).map((mr) => mr.id_menu)
    );

    return menus
      .filter((m) => idsPermitidos.has(m.id_menu))
      .sort((a, b) => a.seccion - b.seccion || a.orden - b.orden);
  }

  // --- Custom Feeds ---
  public getCustomFeeds(): CustomFeed[] {
    const data = localStorage.getItem(STORAGE_KEYS.CUSTOM_FEEDS);
    return data ? JSON.parse(data) : CUSTOM_FEEDS_SEMILLA;
  }

  public crearCustomFeed(nombre: string, comunidades: string[] = ['s/CMTC']): CustomFeed {
    const feeds = this.getCustomFeeds();
    const nuevo: CustomFeed = {
      id: `custom-feed-${Date.now()}`,
      nombre,
      icono: 'Layers',
      comunidades,
    };
    feeds.push(nuevo);
    localStorage.setItem(STORAGE_KEYS.CUSTOM_FEEDS, JSON.stringify(feeds));
    return nuevo;
  }

  // Configuración de Backend C#
  public getBackendConfig() {
    return {
      isLive: this.isConfiguredForRealBackend,
      baseUrl: this.backendBaseUrl,
    };
  }

  public setBackendConfig(isLive: boolean, baseUrl: string) {
    this.isConfiguredForRealBackend = isLive;
    this.backendBaseUrl = baseUrl;
  }
}

export const serenaApi = new SerenaApiService();
