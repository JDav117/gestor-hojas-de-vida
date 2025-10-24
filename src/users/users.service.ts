import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    // Validar email único
    const existing = await this.usersRepository.findOne({ where: [{ email }, { identificacion }] });
    if (existing) {
      throw new BadRequestException('El email o la identificación ya están registrados');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({ ...userData, email, identificacion, password_hash: hashedPassword });
    if (roles && roles.length > 0) {
      user.roles = await this.rolesRepository.findByIds(roles);
    }
    return this.usersRepository.save(user);
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) throw new Error('User not found');
    Object.assign(user, updateUserDto);
    if (updateUserDto.roles) {
      user.roles = await this.rolesRepository.findByIds(updateUserDto.roles);
    }
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
