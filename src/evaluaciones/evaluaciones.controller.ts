import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, NotFoundException,
  InternalServerErrorException } from '@nestjs/common';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('evaluaciones')

export class EvaluacionesController {
  constructor(private readonly evaluacionesService: EvaluacionesService) {}

  @Post()
  async create(@Body() createEvaluacionDto: CreateEvaluacionDto) {
    try {
      return await this.evaluacionesService.create(createEvaluacionDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear la evaluación: ${error.message}`,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.evaluacionesService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener evaluaciones: ${error.message}`,
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const evaluacion = await this.evaluacionesService.findOne(id);
      if (!evaluacion) {
        throw new NotFoundException(`Evaluación con ID ${id} no encontrada`);
      }
      return evaluacion;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener la evaluación: ${error.message}`,
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEvaluacionDto: UpdateEvaluacionDto,
  ) {
    try {
      return await this.evaluacionesService.update(id, updateEvaluacionDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar la evaluación: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.evaluacionesService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar la evaluación: ${error.message}`,
      );
    }
  }
}
