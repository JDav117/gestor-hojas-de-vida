
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AsignacionesService } from '../asignaciones/asignaciones.service';
import { DocumentosService } from './documentos.service';
import { PostulacionesService } from '../postulaciones/postulaciones.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@UseGuards(JwtAuthGuard)
@Controller('documentos')
export class DocumentosController {
  constructor(
    private readonly documentosService: DocumentosService,
    @Inject(forwardRef(() => PostulacionesService))
    private readonly postulacionesService: PostulacionesService,
    private readonly asignacionesService: AsignacionesService,
  ) {}

  @Post()
  async create(@Body() createDocumentoDto: CreateDocumentoDto, @Req() req: any) {
    // Validar que el documento pertenezca a una postulación del usuario (o admin)
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      const postulacion = await this.postulacionesService.findOne(createDocumentoDto.postulacion_id);
      if (!postulacion || postulacion.postulante_id !== user.userId) {
        throw new ForbiddenException('No puedes adjuntar documentos a postulaciones de otros usuarios');
      }
    }
    return this.documentosService.create(createDocumentoDto);
  }

  @Get()
  async findAll(@Req() req: any) {
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    if (isAdmin) return this.documentosService.findAll();
    if (roles.includes('postulante')) {
      const postulaciones = await this.postulacionesService.findAllForPostulante(user.userId);
      const ids = postulaciones.map(p => p.id);
      return this.documentosService.findByPostulacionIds(ids);
    }
    if (roles.includes('evaluador')) {
      const ids = await this.asignacionesService.getPostulacionIdsForEvaluador(user.userId);
      return this.documentosService.findByPostulacionIds(ids);
    }
    return [];
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const documento = await this.documentosService.findOne(id);
    if (!documento) throw new ForbiddenException('Documento no encontrado');
    const postulacion = await this.postulacionesService.findOne(documento.postulacion_id);
    if (!postulacion) throw new ForbiddenException('Postulación asociada no encontrada');
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    if (postulacion.postulante_id === user.userId) return documento;
    if (isAdmin) return documento;
    if (roles.includes('evaluador')) {
      const assigned = await this.asignacionesService.isAssigned(user.userId, postulacion.id);
      if (assigned) return documento;
    }
    {
      throw new ForbiddenException('No tienes permiso para ver este documento');
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDocumentoDto: UpdateDocumentoDto,
    @Req() req: any,
  ) {
    const documento = await this.documentosService.findOne(id);
    if (!documento) throw new ForbiddenException('Documento no encontrado');
    const postulacion = await this.postulacionesService.findOne(documento.postulacion_id);
    if (!postulacion) throw new ForbiddenException('Postulación asociada no encontrada');
    const user = req.user;
    const isAdmin = Array.isArray(user.roles) && (user.roles.includes('admin') || user.roles.some((r: any) => r.nombre_rol === 'admin'));
    if (postulacion.postulante_id !== user.userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para modificar este documento');
    }
    return this.documentosService.update(id, updateDocumentoDto);
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    const documento = await this.documentosService.findOne(id);
    if (!documento) throw new ForbiddenException('Documento no encontrado');
    const postulacion = await this.postulacionesService.findOne(documento.postulacion_id);
    if (!postulacion) throw new ForbiddenException('Postulación asociada no encontrada');
    const user = req.user;
    const isAdmin = Array.isArray(user.roles) && (user.roles.includes('admin') || user.roles.some((r: any) => r.nombre_rol === 'admin'));
    if (postulacion.postulante_id !== user.userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }
    return this.documentosService.remove(id);
  }
}
