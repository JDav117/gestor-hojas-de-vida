import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException, Query } from '@nestjs/common';
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
  findAll(
    @Req() req: any,
    @Query('convocatoria') convocatoria?: string,
    @Query('estado') estado?: string,
    @Query('postulante') postulante?: string,
    @Query('programa') programa?: string,
  ) {
    const user = req.user;
    const roles = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => String(typeof r === 'string' ? r : r.nombre_rol).toLowerCase())
      : [];
    const isAdmin = roles.includes('admin');
    const isPostulante = roles.includes('postulante');
    const isEvaluador = roles.includes('evaluador');
    if (isAdmin) {
      const filters: { convocatoria_id?: number; estado?: string; postulante_id?: number; programa_id?: number } = {};
      if (convocatoria && !isNaN(Number(convocatoria))) filters.convocatoria_id = Number(convocatoria);
      if (postulante && !isNaN(Number(postulante))) filters.postulante_id = Number(postulante);
      if (programa && !isNaN(Number(programa))) filters.programa_id = Number(programa);
      if (estado) filters.estado = estado;
      if (Object.keys(filters).length > 0) return this.postulacionesService.findFiltered(filters);
      return this.postulacionesService.findAll();
    }
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
    const roles = Array.isArray(user?.roles)
      ? user.roles.map((r: any) => String(typeof r === 'string' ? r : r.nombre_rol).toLowerCase())
      : [];
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

  @Post('draft/:convocatoriaId')
  async draft(@Param('convocatoriaId', ParseIntPipe) convocatoriaId: number, @Req() req: any) {
    const postulante_id = req.user?.userId;
    if (!postulante_id) throw new ForbiddenException('No autenticado');
    return this.postulacionesService.findOrCreateDraft(postulante_id, convocatoriaId);
  }

@Post(':id/submit')
async submit(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
  const userId = req.user?.userId; // el id del usuario autenticado
  if (!userId) throw new ForbiddenException('No autenticado');

  try {
    return await this.postulacionesService.submit(id, userId);
  } catch (e: any) {
    throw new ForbiddenException(e?.message || 'No se pudo enviar la postulación');
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
