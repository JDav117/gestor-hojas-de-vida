import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evaluaciones')
export class Evaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postulacion_id: number;

  @Column()
  evaluador_id: number;

  @Column()
  fecha: Date;

  @Column('float')
  puntaje_total: number;
}
