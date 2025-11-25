import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProgramasAcademicosService } from './programas-academicos.service';
import { CreateProgramaAcademicoDto } from './dto/create-programa-academico.dto';
import { UpdateProgramaAcademicoDto } from './dto/update-programa-academico.dto';
import { JwtRolesGuard } from '../common/jwt-roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('programas-academicos')
export class ProgramasAcademicosController {
  constructor(private readonly programasAcademicosService: ProgramasAcademicosService) {}

  @Post()
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  create(@Body() createProgramaAcademicoDto: CreateProgramaAcademicoDto) {
    return this.programasAcademicosService.create(createProgramaAcademicoDto);
  }

  @Get()
  findAll() {
    return this.programasAcademicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.programasAcademicosService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramaAcademicoDto: UpdateProgramaAcademicoDto,
  ) {
    return this.programasAcademicosService.update(id, updateProgramaAcademicoDto);
  }

  @Delete(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programasAcademicosService.remove(id);
  }
}
