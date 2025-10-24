import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ItemsEvaluacionService } from './items-evaluacion.service';
import { CreateItemEvaluacionDto } from './dto/create-item-evaluacion.dto';
import { UpdateItemEvaluacionDto } from './dto/update-item-evaluacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('items-evaluacion')
export class ItemsEvaluacionController {
  constructor(private readonly itemsEvaluacionService: ItemsEvaluacionService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  create(@Body() createItemEvaluacionDto: CreateItemEvaluacionDto) {
    return this.itemsEvaluacionService.create(createItemEvaluacionDto);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','evaluador')
  findAll() {
    return this.itemsEvaluacionService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin','evaluador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsEvaluacionService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemEvaluacionDto: UpdateItemEvaluacionDto,
  ) {
    return this.itemsEvaluacionService.update(id, updateItemEvaluacionDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsEvaluacionService.remove(id);
  }
}
