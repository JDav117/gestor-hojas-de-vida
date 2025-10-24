import { Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn } from 'typeorm';

@Entity('asignaciones')
@Unique(['evaluador_id', 'postulacion_id'])
export class Asignacion {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  evaluador_id: number;

  @Column()
  postulacion_id: number;

  @CreateDateColumn({ type: 'datetime' })
  created_at: Date;
}
