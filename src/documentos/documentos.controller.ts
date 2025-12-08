
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, Req, ForbiddenException, Inject, forwardRef, UploadedFile, UseInterceptors, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
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

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documentos',
      filename: (req, file, cb) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      if (!file.originalname.match(/\.(pdf|jpg|jpeg|png)$/i)) {
        return cb(new BadRequestException('Solo se permiten archivos PDF, JPG, JPEG o PNG'), false);
      }
      cb(null, true);
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  }))
  async uploadDocumento(
    @UploadedFile() file: Express.Multer.File,
    @Body('postulacion_id') postulacionId: string,
    @Body('nombre_documento') nombreDocumento: string,
    @Req() req: any
  ) {
    if (!file) {
      throw new BadRequestException('Debe proporcionar un archivo');
    }

    const postulacion_id = parseInt(postulacionId, 10);
    
    // Validar que el documento pertenezca a una postulación del usuario
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    
    if (!isAdmin) {
      const postulacion = await this.postulacionesService.findOne(postulacion_id);
      if (!postulacion || postulacion.postulante_id !== user.userId) {
        throw new ForbiddenException('No puedes adjuntar documentos a postulaciones de otros usuarios');
      }
    }

    const createDto: CreateDocumentoDto = {
      postulacion_id,
      nombre_documento: nombreDocumento,
      ruta_archivo: file.path,
    };

    return this.documentosService.create(createDto);
  }

  @Post()
  async create(@Body() createDocumentoDto: CreateDocumentoDto, @Req() req: any) {
    // Validar que el documento pertenezca a una postulación del usuario (o admin)
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    if (!isAdmin) {
      const postulacion = await this.postulacionesService.findOne(createDocumentoDto.postulacion_id);
      if (!postulacion || postulacion.postulante.id !== user.userId) {
        throw new ForbiddenException('No puedes adjuntar documentos a postulaciones de otros usuarios');
      }
    }
    return this.documentosService.create(createDocumentoDto);
  }

  @Get('postulacion/:postulacionId')
  async findByPostulacion(
    @Param('postulacionId', ParseIntPipe) postulacionId: number,
    @Req() req: any
  ) {
    // Validar acceso a la postulación
    const user = req.user;
    const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
    const isAdmin = roles.includes('admin');
    
    if (!isAdmin) {
      const postulacion = await this.postulacionesService.findOne(postulacionId);
      if (!postulacion) {
        throw new ForbiddenException('Postulación no encontrada');
      }
      
      // Permitir al postulante ver sus documentos
      if (postulacion.postulante_id === user.userId) {
        return this.documentosService.findByPostulacionId(postulacionId);
      }
      
      // Permitir a evaluadores asignados ver documentos
      if (roles.includes('evaluador')) {
        const assigned = await this.asignacionesService.isAssigned(user.userId, postulacionId);
        if (assigned) {
          return this.documentosService.findByPostulacionId(postulacionId);
        }
      }
      
      throw new ForbiddenException('No tienes permiso para ver estos documentos');
    }
    
    return this.documentosService.findByPostulacionId(postulacionId);
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
    if (postulacion.postulante.id === user.userId) return documento;
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
    if (postulacion.postulante.id !== user.userId && !isAdmin) {
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
    if (postulacion.postulante.id !== user.userId && !isAdmin) {
      throw new ForbiddenException('No tienes permiso para eliminar este documento');
    }
    return this.documentosService.remove(id);
  }
}
