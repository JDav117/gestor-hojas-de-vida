import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('programas_academicos')
export class ProgramaAcademico {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre_programa: string;

  // Campos adicionales para enriquecer el formulario de programas
  @Column({ type: 'varchar', length: 255, nullable: true })
  facultad?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  nivel?: string; // pregrado, posgrado, especialización, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  modalidad?: string; // presencial, virtual, mixta

  @Column({ type: 'varchar', length: 64, nullable: true })
  codigo_snies?: string;

  @Column({ type: 'text', nullable: true })
  descripcion?: string;
}
