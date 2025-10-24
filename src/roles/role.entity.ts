import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Usuario } from '../users/user.entity';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  nombre_rol: string;

  @ManyToMany(() => Usuario, (usuario) => usuario.roles)
  usuarios: Usuario[];   
}

