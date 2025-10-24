
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
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
  ) {}

  @Post()
  create(@Body() createDocumentoDto: CreateDocumentoDto) {
    return this.documentosService.create(createDocumentoDto);
  }

  @Get()
  findAll() {
    return this.documentosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentosService.findOne(id);
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
