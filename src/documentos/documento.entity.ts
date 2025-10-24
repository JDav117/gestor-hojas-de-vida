import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('documentos')
export class Documento {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  postulacion_id: number;

  @Column()
  nombre_documento: string;

  @Column()
  ruta_archivo: string;
}
