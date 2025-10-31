import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Postulacion } from '../postulaciones/postulacion.entity';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postulacion_id: number;

  @ManyToOne(() => Postulacion, (p) => p.documentos, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postulacion_id' })
  postulacion: Postulacion;

  @Column()
  nombre_documento: string;

  @Column()
  ruta_archivo: string;
}
