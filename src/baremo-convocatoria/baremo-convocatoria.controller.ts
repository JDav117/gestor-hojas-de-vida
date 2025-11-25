
import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { BaremoConvocatoriaService } from './baremo-convocatoria.service';
import { CreateBaremoConvocatoriaDto } from './dto/create-baremo-convocatoria.dto';
import { UpdateBaremoConvocatoriaDto } from './dto/update-baremo-convocatoria.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtRolesGuard } from '../common/jwt-roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('baremo-convocatoria')
export class BaremoConvocatoriaController {
  constructor(private readonly baremoConvocatoriaService: BaremoConvocatoriaService) {}

  @Post()
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  create(@Body() createBaremoConvocatoriaDto: CreateBaremoConvocatoriaDto) {
    return this.baremoConvocatoriaService.create(createBaremoConvocatoriaDto);
  }

  @Get()
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  findAll() {
    return this.baremoConvocatoriaService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.baremoConvocatoriaService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBaremoConvocatoriaDto: UpdateBaremoConvocatoriaDto,
  ) {
    return this.baremoConvocatoriaService.update(id, updateBaremoConvocatoriaDto);
  }

  @Delete(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.baremoConvocatoriaService.remove(id);
  }
}
