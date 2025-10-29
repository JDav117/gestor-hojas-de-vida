import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('convocatorias')
export class Convocatoria {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nombre: string;

  // Descripción opcional de la convocatoria
  @Column({ type: 'text', nullable: true })
  descripcion?: string | null;

  @Column({ type: 'datetime' })
  fecha_apertura: Date;

  @Column({ type: 'datetime' })
  fecha_cierre: Date;

  @Column()
  estado: string;
}
