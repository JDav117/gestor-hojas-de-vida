import {Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards, NotFoundException, InternalServerErrorException,
} from '@nestjs/common';
import { ItemsEvaluacionService } from './items-evaluacion.service';
import { CreateItemEvaluacionDto } from './dto/create-item-evaluacion.dto';
import { UpdateItemEvaluacionDto } from './dto/update-item-evaluacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('items-evaluacion')
export class ItemsEvaluacionController {
  constructor(private readonly itemsEvaluacionService: ItemsEvaluacionService) {}

  @Post()
  @Roles('admin')
  async create(@Body() createItemEvaluacionDto: CreateItemEvaluacionDto) {
    try {
      return await this.itemsEvaluacionService.create(createItemEvaluacionDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al crear el ítem de evaluación: ${error.message}`,
      );
    }
  }

  @Get()
  @Roles('admin', 'evaluador')
  async findAll() {
    try {
      return await this.itemsEvaluacionService.findAll();
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener los ítems de evaluación: ${error.message}`,
      );
    }
  }

  @Get(':id')
  @Roles('admin', 'evaluador')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const item = await this.itemsEvaluacionService.findOne(id);
      if (!item) {
        throw new NotFoundException(`Ítem de evaluación con ID ${id} no encontrado`);
      }
      return item;
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al obtener el ítem de evaluación: ${error.message}`,
      );
    }
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemEvaluacionDto: UpdateItemEvaluacionDto,
  ) {
    try {
      return await this.itemsEvaluacionService.update(id, updateItemEvaluacionDto);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al actualizar el ítem de evaluación: ${error.message}`,
      );
    }
  }

  @Delete(':id')
  @Roles('admin')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.itemsEvaluacionService.remove(id);
    } catch (error) {
      throw new InternalServerErrorException(
        `Error al eliminar el ítem de evaluación: ${error.message}`,
      );
    }
  }
}

