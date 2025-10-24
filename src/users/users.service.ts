import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Usuario } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Usuario)
    private readonly userRepository: Repository<Usuario>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { email, identificacion, password, ...rest } = createUserDto as any;

    // Verificar duplicados (email o identificacion)
    const existeEmail = await this.userRepository.findOne({ where: { email } });
    if (existeEmail) {
      // Mensaje requerido por la especificación: "El elemento ya existe"
      throw new BadRequestException('El elemento ya existe');
    }

    const existeId = await this.userRepository.findOne({ where: { identificacion } });
    if (existeId) {
      throw new BadRequestException('El elemento ya existe');
    }

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    const user = this.userRepository.create({
      ...rest,
      email,
      identificacion,
      password_hash: hash,
    });

    return this.userRepository.save(user);
  }

  async findAll(): Promise<Usuario[]> {
    return this.userRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const u = await this.userRepository.findOne({ where: { id } });
    if (!u) throw new NotFoundException('Usuario no encontrado');
    return u;
  }

  async findByEmail(email: string): Promise<Usuario | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async update(id: number, updateDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if ((updateDto as any).email && (updateDto as any).email !== user.email) {
      const e = await this.userRepository.findOne({ where: { email: (updateDto as any).email } });
      if (e) throw new BadRequestException('El elemento ya existe');
    }

    if ((updateDto as any).identificacion && (updateDto as any).identificacion !== user.identificacion) {
      const idExists = await this.userRepository.findOne({ where: { identificacion: (updateDto as any).identificacion } });
      if (idExists) throw new BadRequestException('El elemento ya existe');
    }

    // Si se envía password en update, hashearla
    if ((updateDto as any).password) {
      const hash = await bcrypt.hash((updateDto as any).password, 10);
      (updateDto as any).password_hash = hash;
      delete (updateDto as any).password;
    }

    await this.userRepository.update(id, updateDto as any);
    return this.findOne(id);
  }

  async remove(id: number) {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
    return { deleted: true };
  }
}
