import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Convocatoria } from '../convocatorias/convocatoria.entity';
import { ProgramaAcademico } from '../programas-academicos/programa-academico.entity';
import { Documento } from '../documentos/documento.entity';

@Entity('postulaciones')
export class Postulacion {
  @PrimaryGeneratedColumn()
  id: number;

  // 🔹 Relaciones reales
  @ManyToOne(() => User)
  @JoinColumn({ name: 'postulante_id' })
  postulante: User;

  @ManyToOne(() => Convocatoria)
  @JoinColumn({ name: 'convocatoria_id' })
  convocatoria: Convocatoria;

  @ManyToOne(() => ProgramaAcademico, { nullable: true })
  @JoinColumn({ name: 'programa_id' })
  programa: ProgramaAcademico;

  // 🔹 Datos base
  @Column({ type: 'datetime', name: 'fecha_postulacion', default: () => 'CURRENT_TIMESTAMP' })
  fechaPostulacion: Date;

  @Column({ default: 'borrador' })
  estado: string;

  @Column({ nullable: true })
  disponibilidad_horaria: string;

  // 🔹 Campos nuevos
  @Column({ type: 'float', default: 0 })
  puntaje_documental: number;

  @Column({ type: 'float', default: 0 })
  puntaje_tecnico: number;

  @Column({ type: 'float', default: 0 })
  puntaje_total: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'datetime', nullable: true })
  submitted_at: Date;

  @Column({ type: 'datetime', nullable: true })
  reviewed_at: Date;

  @Column({ type: 'datetime', nullable: true })
  evaluated_at: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // 🔹 Relación con Documentos
  @OneToMany(() => Documento, (doc) => doc.postulacion)
  documentos: Documento[];
}
