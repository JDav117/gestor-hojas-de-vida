import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('evaluaciones')
export class Evaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postulacion_id: number;

  @Column()
  evaluador_id: number;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  fecha: Date;

  @Column('float')
  puntaje_total: number;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @Column({ type: 'json', nullable: true })
  detalles_puntajes: any;

  @Column({ type: 'boolean', default: false })
  finalizada: boolean;
}
