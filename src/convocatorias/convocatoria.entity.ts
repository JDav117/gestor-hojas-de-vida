import {
  Entity, PrimaryGeneratedColumn, Column,
  ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { ProgramaAcademico } from '../programas-academicos/programa-academico.entity';


@Entity('convocatorias')
export class Convocatoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  @Column({ type: 'text', nullable: true })
  descripcion: string;

  @Column({ type: 'datetime' })
  fecha_apertura: Date;

  @Column({ type: 'datetime' })
  fecha_cierre: Date;

  @Column({
    type: 'enum',
    enum: ['borrador', 'publicada', 'cerrada', 'anulada'],
    default: 'borrador'
  })
  estado: string;

  // 🔹 Relación con Programa Académico
  @ManyToOne(() => ProgramaAcademico, { nullable: true })
  @JoinColumn({ name: 'programa_academico_id' })
  programa: ProgramaAcademico;

  // 🔹 Campos adicionales de la convocatoria
  @Column({ nullable: true })
  cupos: number;

  @Column({ nullable: true })
  sede: string;

  @Column({ nullable: true })
  dedicacion: string;

  @Column({ nullable: true })
  tipo_vinculacion: string;

  @Column({ type: 'json', nullable: true })
  requisitos_documentales: any;

  @Column({ type: 'float', default: 0 })
  min_puntaje_aprobacion_documental: number;

  @Column({ type: 'float', default: 0 })
  min_puntaje_aprobacion_tecnica: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
