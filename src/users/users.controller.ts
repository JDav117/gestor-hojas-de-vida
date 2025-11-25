import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/roles.decorator';
import { JwtRolesGuard } from '../common/jwt-roles.guard';
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
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(Number(id));
    if (!user) {
      return { statusCode: 404, message: 'User not found' };
    }
    return user;
  }

  @Put(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(Number(id), updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtRolesGuard)
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
    // Usar el DTO completo para actualizar el perfil
    const updated = await this.usersService.updateProfile(Number(userId), body);
    const { password_hash, ...safe } = updated as any;
    return safe;
  }
}
