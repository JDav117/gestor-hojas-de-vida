import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { PostulacionesService } from './postulaciones.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AsignacionesService } from '../asignaciones/asignaciones.service';

@UseGuards(JwtAuthGuard)
@Controller('postulaciones')
export class PostulacionesController {
  constructor(
    private readonly postulacionesService: PostulacionesService,
    private readonly asignacionesService: AsignacionesService,
  ) {}

  @Post()
  create(@Body() createPostulacionDto: CreatePostulacionDto, @Req() req: any) {
    // Forzar ownership: ignorar postulante_id entrante
    const postulante_id = req.user?.userId;
    return this.postulacionesService.create({ ...createPostulacionDto, postulante_id });
  }

  @Get()
  findAll(@Req() req: any) {
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    const isPostulante = roles.includes('postulante');
    const isEvaluador = roles.includes('evaluador');
    if (isAdmin) return this.postulacionesService.findAll();
    if (isPostulante) return this.postulacionesService.findAllForPostulante(user.userId);
    if (isEvaluador) {
      return this.asignacionesService.getPostulacionIdsForEvaluador(user.userId).then(ids => this.postulacionesService.findByIds(ids));
    }
    return [];
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const postulacion = await this.postulacionesService.findOne(id);
    if (!postulacion) throw new ForbiddenException('Postulación no encontrada');
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    const isEvaluador = roles.includes('evaluador');
    if (postulacion.postulante_id === user.userId) return postulacion;
    if (isAdmin) return postulacion;
    if (isEvaluador) {
      const assigned = await this.asignacionesService.isAssigned(user.userId, postulacion.id);
      if (assigned) return postulacion;
    }
    {
      throw new ForbiddenException('No tienes permiso para ver esta postulación');
    }
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
