import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('postulaciones')
export class PostulacionesController {
  constructor(private readonly postulacionesService: PostulacionesService) {}

  @Post()
  create(@Body() createPostulacionDto: CreatePostulacionDto) {
    return this.postulacionesService.create(createPostulacionDto);
  }

  @Get()
  findAll() {
    return this.postulacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.postulacionesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostulacionDto: UpdatePostulacionDto,
    @Req() req: any,
  ) {
    const postulacion = await this.postulacionesService.findOne(id);
    if (!postulacion) throw new ForbiddenException('Postulación no encontrada');
    const user = req.user;
    const isAdmin = user.roles && (user.roles.includes('admin') || user.roles.some((r: any) => r.nombre_rol === 'admin'));
    if (postulacion.postulante_id !== user.userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para modificar esta postulación');
    }
    return this.postulacionesService.update(id, updatePostulacionDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const postulacion = await this.postulacionesService.findOne(id);
    if (!postulacion) throw new ForbiddenException('Postulación no encontrada');
    const user = req.user;
    const isAdmin = user.roles && (user.roles.includes('admin') || user.roles.some((r: any) => r.nombre_rol === 'admin'));
    if (postulacion.postulante_id !== user.userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar esta postulación');
    }
    return this.postulacionesService.remove(id);
  }
}
