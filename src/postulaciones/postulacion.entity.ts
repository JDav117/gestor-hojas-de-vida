import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('postulaciones')
export class Postulacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postulante_id: number;

  @Column()
  convocatoria_id: number;

  @Column({ type: 'int', nullable: true })
  programa_id: number | null;

  @Column({ type: 'datetime' })
  fecha_postulacion: Date;

  @Column({ default: 'borrador' })
  estado: string;

  @Column({ nullable: true })
  disponibilidad_horaria: string;
}
