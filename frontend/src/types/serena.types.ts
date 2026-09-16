/**
 * Tipos de datos para SERENA (Plataforma Web de Acompañamiento Psicológico SENA)
 * Mapeo 1:1 con las 11 tablas relacionales del SRS IEEE 830 (SQL Server / EF Core C#)
 */

export interface Rol {
  id_rol: number;
  nombre_rol: 'Aprendiz' | 'Psicólogo' | 'Administrador';
}

export interface Usuario {
  id_usuario: number;
  nombre_usuario: string;
  email: string;
  id_rol: number;
  centro: 'CMTC' | 'CMM' | 'CEET';
  num_ficha?: string;
  avatar_url?: string;
  especialidad?: string; // Para psicólogos
  telefono?: string;
  horario_atencion?: string; // Ej: "Lunes a Viernes 8:00 AM - 12:00 PM"
  disponibilidad?: string[]; // Franjas horarias disponibles
  tipo_documento?: 'CC' | 'TI' | 'CE' | 'PEP';
  documento?: string;
  programa_formacion?: string;
  jornada?: 'Diurna' | 'Nocturna' | 'Mixta' | 'Fines de Semana';
  estado_formativo?: 'Etapa Lectiva' | 'Etapa Productiva' | 'Condicionado' | 'Egresado';
}

export interface Menu {
  id_menu: number;
  nombre_menu: string;
  nombre_menu_en?: string;
  icono?: string;
  ruta: string;
  seccion: number;
  orden: number;
  es_accion?: boolean;
}

export interface MenuRol {
  id_menu_rol: number;
  id_rol: number;
  id_menu: number;
}

export interface CustomFeed {
  id: string;
  nombre: string;
  icono?: string;
  descripcion?: string;
  comunidades: string[];
}

export interface Cita {
  id_cita: number;
  fecha_hora: string; // ISO string
  motivo: string;
  estado_cita: 'Pendiente' | 'Confirmada' | 'Realizada' | 'Cancelada';
  id_usuario_aprendiz: number;
  id_usuario_psicologo: number;
  // Campos auxiliares para la UI
  aprendiz?: Usuario;
  psicologo?: Usuario;
  es_solicitud_sin_agendar?: boolean; // Solicitud enviada por psicólogo sin fecha fija
  comentarios_sesion?: string[]; // Anotaciones/comentarios de la cita realizadas por los psicólogos
}

export interface HistorialCita {
  id_h_cita: number;
  id_cita: number;
  observaciones_historial: string;
  fecha_cambio: string;
  estado_anterior?: string;
  estado_nuevo?: string;
}

export interface CertificadoSoporte {
  id_soporte: number;
  id_usuario: number; // Aprendiz
  nombre_documento: string; // ej: "Certificado de Incapacidad Médica", "Remisión a Psiquiatría"
  entidad: string; // ej: "EPS Sanitas", "Compensar EPS", "Hospital Mental", "SURA"
  fecha_emision: string;
  medico_especialista?: string;
  tipo_archivo: 'PDF' | 'DOCX' | 'JPG';
  tamano?: string;
  observaciones?: string;
  diagnostico_cie10?: string;
}

export interface AnotacionClinica {
  id_anotacion: number;
  id_usuario_aprendiz: number;
  id_usuario_psicologo: number;
  nombre_psicologo: string;
  fecha: string;
  tipo: 'Evolución' | 'Comentario' | 'Condición' | 'Acuerdo';
  contenido: string;
}

export interface VotoUsuario {
  id_voto: number;
  id_usuario: number;
  id_publicacion: number;
  tipo: 'upvote' | 'downvote';
  fecha: string;
}

export interface HistorialClinico {
  id_hl_clinico: number;
  id_usuario: number; // Aprendiz
  num_ficha: string;
  fecha_apertura: string;
  historial_clinicoCol?: string;
  condiciones: string;
  condiciones_lista?: string[]; // Lista de condiciones activas
  antecedentes: string;
  evolucion_clinica?: string;
  condicion_actual?: string;
}

export type HistoriaClinica = HistorialClinico;


export interface Diario {
  id_diario: number;
  id_usuario: number;
  fecha_apertura: string;
  compartir_sp: number; // 1 = Compartido con psicólogo, 0 = Privado
  contenido: string; // Encriptado simulado AES
  titulo?: string;
}

export interface EstadoDeAnimo {
  id_estado: number;
  nombre_estado: 'Feliz' | 'Calmado' | 'Ansioso' | 'Triste' | 'Motivado';
  fecha_estado: string;
  id_usuario: number;
  centro: 'CMTC' | 'CMM' | 'CEET';
  avatar_path: string;
  nota?: string;
  intensidad?: number; // 1 - 5
}

export interface Publicacion {
  id_publicaciones: number;
  titulo: string;
  contenido: string;
  fecha_publicacion: string;
  id_usuario: number; // Psicólogo o Admin
  id_comunidad: string; // 's/CMTC', 's/CMTC/economia', etc.
  autor?: Usuario;
  votos: number;
  comentarios_count: number;
  comentarios?: number;
  imagen_url?: string;
  etiqueta?: string;
}

export interface Emergencia {
  id_emergencia: number;
  id_usuario: number;
  fecha_emergencia: string;
  descripcion: string;
  estado?: 'Registrada' | 'Atendida' | 'En seguimiento';
  usuario?: Usuario;
}

export interface Formulario {
  id_formulario: number;
  nombre_formulario: string;
  id_usuario: number; // Creador psicólogo
  descripcion: string;
  preguntas_count: number;
  tiempo_estimado?: string;
  id_comunidad?: string;
  respondido?: boolean;
}

export interface Comunidad {
  id: string; // e.g. 's/CMTC', 's/CMTC/economia', 's/CMM'
  centro: 'CMTC' | 'CMM' | 'CEET';
  sub_nombre: string;
  nombre_completo: string;
  descripcion: string;
  icono: string;
  es_oficial: boolean;
  creado_por_id?: number;
}
