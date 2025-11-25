import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, NotFoundException,
  InternalServerErrorException, ForbiddenException, Req } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtRolesGuard } from '../common/jwt-roles.guard';
import { Roles } from '../common/roles.decorator';
import { AsignacionesService } from '../asignaciones/asignaciones.service';

@Controller('evaluaciones')

export class EvaluacionesController {
  constructor(
    private readonly evaluacionesService: EvaluacionesService,
    private readonly asignacionesService: AsignacionesService,
  ) {}

  @Post()
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  async create(@Body() createEvaluacionDto: CreateEvaluacionDto, @Req() req: any) {
    try {
      const user = req.user;
      const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
      const isAdmin = roles.includes('admin');
      const isEvaluador = roles.includes('evaluador');
      if (isEvaluador && !isAdmin) {
        const assigned = await this.asignacionesService.isAssigned(user.userId, createEvaluacionDto.postulacion_id);
        if (!assigned) throw new ForbiddenException('No estás asignado a esta postulación');
        // Forzar evaluador_id a partir del token
        createEvaluacionDto.evaluador_id = user.userId;
      }
      return await this.evaluacionesService.create(createEvaluacionDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la evaluación: ${error.message}`,
      );
    }
  }

  @Get()
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  async findAll(@Req() req: any) {
    try {
      const user = req.user;
      const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
      if (roles.includes('admin')) return await this.evaluacionesService.findAll();
      if (roles.includes('evaluador')) return await this.evaluacionesService.findByEvaluador(user.userId);
      return [];
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener evaluaciones: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      const evaluacion = await this.evaluacionesService.findOne(id);
      if (!evaluacion) {
        throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
      }
      const user = req.user;
      const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
      if (roles.includes('admin')) return evaluacion;
      if (roles.includes('evaluador') && evaluacion.evaluador_id === user.userId) return evaluacion;
      throw new ForbiddenException('No tienes permiso para ver esta evaluación');
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener la evaluación: ${error.message}`,
      );
    }
  }

  @Patch(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
    @Req() req: any,
  ) {
    try {
      const current = await this.evaluacionesService.findOne(id);
      if (!current) throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
      const user = req.user;
      const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
      const isAdmin = roles.includes('admin');
      const isEvaluador = roles.includes('evaluador');
      if (isEvaluador && !isAdmin) {
        if (current.evaluador_id !== user.userId) throw new ForbiddenException('Solo puedes modificar tus propias evaluaciones');
        const assigned = await this.asignacionesService.isAssigned(user.userId, current.postulacion_id);
        if (!assigned) throw new ForbiddenException('No estás asignado a esta postulación');
      }
      return await this.evaluacionesService.update(id, updateEvaluacionDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar la evaluación: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: any) {
    try {
      const current = await this.evaluacionesService.findOne(id);
      if (!current) throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
      const user = req.user;
      const roles = Array.isArray(user?.roles) ? user.roles.map((r: any) => typeof r === 'string' ? r : r.nombre_rol) : [];
      const isAdmin = roles.includes('admin');
      const isEvaluador = roles.includes('evaluador');
      if (isEvaluador && !isAdmin) {
        if (current.evaluador_id !== user.userId) throw new ForbiddenException('Solo puedes eliminar tus propias evaluaciones');
        const assigned = await this.asignacionesService.isAssigned(user.userId, current.postulacion_id);
        if (!assigned) throw new ForbiddenException('No estás asignado a esta postulación');
      }
      return await this.evaluacionesService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar la evaluación: ${error.message}`,
      );
    }
  }
}
