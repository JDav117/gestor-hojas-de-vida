import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('items_evaluacion')
export class ItemEvaluacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre_item: string;

  @Column('text')
  descripcion: string;
}
