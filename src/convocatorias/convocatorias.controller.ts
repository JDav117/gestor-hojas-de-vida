import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ConvocatoriasService } from './convocatorias.service';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';
import { UpdateConvocatoriaDto } from './dto/update-convocatoria.dto';
import { JwtRolesGuard } from '../common/jwt-roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('convocatorias')
export class ConvocatoriasController {
  constructor(private readonly convocatoriasService: ConvocatoriasService) {}

  @Post()
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  create(@Body() createConvocatoriaDto: CreateConvocatoriaDto) {
    return this.convocatoriasService.create(createConvocatoriaDto);
  }

  @Get()
  findAll() {
    return this.convocatoriasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.convocatoriasService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateConvocatoriaDto: UpdateConvocatoriaDto,
  ) {
    return this.convocatoriasService.update(id, updateConvocatoriaDto);
  }

  @Delete(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.convocatoriasService.remove(id);
  }
}
