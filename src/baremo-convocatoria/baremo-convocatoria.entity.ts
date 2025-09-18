import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('baremo_convocatoria')
export class BaremoConvocatoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  convocatoria_id: number;

  @Column()
  item_evaluacion_id: number;

  @Column('float')
  puntaje_maximo: number;
}
