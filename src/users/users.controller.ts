import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { UpdateMeDto } from 'src/users/dto/update-me.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Perfil propio: obtener usuario autenticado
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    const userId = req.user?.userId;
    if (!userId) return { statusCode: 401, message: 'Unauthorized' };
    const user = await this.usersService.findOne(Number(userId));
    if (!user) return { statusCode: 404, message: 'User not found' };
    const { password_hash, ...safe } = user as any;
    return safe;
  }

  

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(Number(id));
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }
    return user;
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(Number(id));
  }

  // Perfil propio: obtener usuario autenticado

  // Perfil propio: actualizar datos básicos (sin roles)
  @Put('me')
  @UseGuards(JwtAuthGuard)
  async updateMe(@Req() req: any, @Body() body: UpdateMeDto) {
    const userId = req.user?.userId;
    if (!userId) return { statusCode: 401, message: 'Unauthorized' };
    // Forzar a ignorar campos no permitidos (roles, password)
    const { nombre, apellido, email, identificacion } = body;
    const updated = await this.usersService.updateProfile(Number(userId), { nombre, apellido, email, identificacion });
    const { password_hash, ...safe } = updated as any;
    return safe;
  }
}
