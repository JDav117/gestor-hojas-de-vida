import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, HttpCode } from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../common/roles.decorator';

@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post('init')
  @HttpCode(201)
  async initRoles() {
    const roles = ['admin', 'user', 'evaluator'];
    const createdRoles = [];
    for (const roleName of roles) {
      try {
        const role = await this.rolesService.create({ nombre_rol: roleName });
        createdRoles.push(role);
      } catch (error) {
        // Ignore duplicate errors
      }
    }
    return createdRoles;
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }


  @Get()
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const role = await this.rolesService.findOne(Number(id));
    if (!role) {
      return { statusCode: 404, message: 'Role not found' };
    }
    return role;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(Number(id), updateRoleDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.rolesService.remove(Number(id));
  }
}
