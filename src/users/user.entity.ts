import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Exclude } from 'class-transformer';
import { Role } from '../roles/role.entity'; 

@Entity({ name: 'usuarios' })
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  nombre: string;

  @Column({ type: 'varchar', length: 255 })
  apellido: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ name: 'password_hash', type: 'varchar', length: 255 })
  @Exclude()
  password_hash: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  identificacion: string;

 @ManyToMany(() => Role, (role) => role.usuarios, { cascade: true })
  @JoinTable({
    name: 'usuario_roles',
    joinColumn: { name: 'usuario_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'rol_id', referencedColumnName: 'id' },
  })
  roles?: Role[];
}
