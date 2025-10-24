import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../roles/role.entity';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { roles, password, email, identificacion, ...userData } = createUserDto;
    const normEmail = email?.toLowerCase().trim();
    // Validar email único
    const existing = await this.usersRepository.findOne({ where: [{ email: normEmail }, { identificacion }] });
    if (existing) {
      throw new BadRequestException('El email o la identificación ya están registrados');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ ...userData, email: normEmail, identificacion, password_hash: hashedPassword });
    if (roles && roles.length > 0) {
      user.roles = await this.rolesRepository.find({ where: { id: In(roles) } });
    }
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    const normEmail = email?.toLowerCase().trim();
    return this.usersRepository.findOne({ where: { email: normEmail } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');
    const { roles, email: updEmail, ...rest } = updateUserDto as any;
    if (typeof updEmail === 'string') {
      rest.email = updEmail.toLowerCase().trim();
    }
    Object.assign(user, rest);
    if (roles) {
      user.roles = await this.rolesRepository.find({ where: { id: In(roles) } });
    }
    return this.usersRepository.save(user);
  }

  // Actualización segura del perfil propio (sin cambiar roles ni password)
  async updateProfile(id: number, data: { nombre?: string; apellido?: string; email?: string; identificacion?: string; }): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');
    const { email, ...rest } = data || {};
    if (typeof email === 'string' && email.trim().length > 0) {
      user.email = email.toLowerCase().trim();
    }
    Object.assign(user, rest);
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  async changePassword(id: number, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.findOne(id);
    if (!user) throw new BadRequestException('User not found');
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) throw new BadRequestException('La contraseña actual no es correcta');
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password_hash = hashed;
    await this.usersRepository.save(user);
  }
}
