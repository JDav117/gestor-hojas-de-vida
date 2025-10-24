
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ItemsEvaluacionService } from './items-evaluacion.service';
import { CreateItemEvaluacionDto } from './dto/create-item-evaluacion.dto';
import { UpdateItemEvaluacionDto } from './dto/update-item-evaluacion.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('items-evaluacion')
export class ItemsEvaluacionController {
  constructor(private readonly itemsEvaluacionService: ItemsEvaluacionService) {}

  @Post()
  create(@Body() createItemEvaluacionDto: CreateItemEvaluacionDto) {
    return this.itemsEvaluacionService.create(createItemEvaluacionDto);
  }

  @Get()
  findAll() {
    return this.itemsEvaluacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsEvaluacionService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemEvaluacionDto: UpdateItemEvaluacionDto,
  ) {
    return this.itemsEvaluacionService.update(id, updateItemEvaluacionDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsEvaluacionService.remove(id);
  }
}
