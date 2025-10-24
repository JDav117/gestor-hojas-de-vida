
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BaremoConvocatoriaService } from './baremo-convocatoria.service';
import { CreateBaremoConvocatoriaDto } from './dto/create-baremo-convocatoria.dto';
import { UpdateBaremoConvocatoriaDto } from './dto/update-baremo-convocatoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('baremo-convocatoria')
export class BaremoConvocatoriaController {
  constructor(private readonly baremoConvocatoriaService: BaremoConvocatoriaService) {}

  @Post()
  create(@Body() createBaremoConvocatoriaDto: CreateBaremoConvocatoriaDto) {
    return this.baremoConvocatoriaService.create(createBaremoConvocatoriaDto);
  }

  @Get()
  findAll() {
    return this.baremoConvocatoriaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.baremoConvocatoriaService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBaremoConvocatoriaDto: UpdateBaremoConvocatoriaDto,
  ) {
    return this.baremoConvocatoriaService.update(id, updateBaremoConvocatoriaDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.baremoConvocatoriaService.remove(id);
  }
}
