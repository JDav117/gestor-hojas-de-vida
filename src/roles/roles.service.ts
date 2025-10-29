import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
  ) {}

  create(createRoleDto: CreateRoleDto): Promise<Role> {
    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  findAll(): Promise<Role[]> {
    return this.rolesRepository.find();
  }

  findOne(id: number): Promise<Role | null> {
    return this.rolesRepository.findOne({ where: { id } });
  }

  async update(id: number, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);
    if (!role) throw new Error('Role not found');
    Object.assign(role, updateRoleDto);
    return this.rolesRepository.save(role);
  }

  async remove(id: number): Promise<void> {
    await this.rolesRepository.delete(id);
  }

  async createInitialRoles(names: string[]): Promise<Role[]> {
    const created: Role[] = [];
    for (const nombre_rol of names) {
      const exists = await this.rolesRepository.findOne({ where: { nombre_rol } });
      if (!exists) {
        const r = this.rolesRepository.create({ nombre_rol });
        created.push(await this.rolesRepository.save(r));
      }
    }
    // Retornar todos los roles actuales (incluidos los ya existentes)
    return this.rolesRepository.find();
  }
}
