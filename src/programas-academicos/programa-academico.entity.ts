import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('programas_academicos')
export class ProgramaAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre_programa: string;
}
