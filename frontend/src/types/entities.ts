// Tipos basados en la estructura de base de datos actualizada

export interface Role {
  id: number;
  nombre_rol: string;
}

export interface User {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  identificacion: string;
  telefono?: string;
  verificado: boolean;
  roles: Role[];
  created_at: string;
  updated_at: string;
}

export interface ProgramaAcademico {
  id: number;
  nombre_programa: string;
  facultad?: string;
  nivel?: string;
  modalidad?: string;
  codigo_snies?: string;
  descripcion?: string;
}

export interface Convocatoria {
  id: number;
  nombre: string;
  descripcion?: string;
  fecha_apertura: string | Date;
  fecha_cierre: string | Date;
  estado: 'borrador' | 'publicada' | 'cerrada' | 'anulada';
  programa_academico_id?: number;
  programa?: ProgramaAcademico;
  cupos?: number;
  sede?: string;
  dedicacion?: string;
  tipo_vinculacion?: string;
  requisitos_documentales?: string[];
  min_puntaje_aprobacion_documental: number;
  min_puntaje_aprobacion_tecnica: number;
  created_at: string;
  updated_at: string;
}

export interface Postulacion {
  id: number;
  postulante_id: number;
  postulante?: User;
  convocatoria_id: number;
  convocatoria?: Convocatoria;
  programa_id?: number;
  programa?: ProgramaAcademico;
  fecha_postulacion: string;
  estado: string;
  disponibilidad_horaria?: string;
  puntaje_documental: number;
  puntaje_tecnico: number;
  puntaje_total: number;
  observaciones?: string;
  submitted_at?: string;
  reviewed_at?: string;
  evaluated_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Documento {
  id: number;
  postulacion_id: number;
  nombre_documento: string;
  ruta_archivo: string;
}

export interface ItemEvaluacion {
  id: number;
  nombre_item: string;
  descripcion: string;
}

export interface BaremoConvocatoria {
  id: number;
  convocatoria_id: number;
  item_evaluacion_id: number;
  puntaje_maximo: number;
  item?: ItemEvaluacion;
}

export interface Evaluacion {
  id: number;
  postulacion_id: number;
  evaluador_id: number;
  fecha: string;
  puntaje_total: number;
  evaluador?: User;
  postulacion?: Postulacion;
}

export interface Asignacion {
  id: number;
  evaluador_id: number;
  postulacion_id: number;
  created_at: string;
  evaluador?: User;
  postulacion?: Postulacion;
}
