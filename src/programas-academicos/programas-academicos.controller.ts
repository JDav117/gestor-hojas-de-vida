import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ProgramasAcademicosService } from './programas-academicos.service';
import { CreateProgramaAcademicoDto } from './dto/create-programa-academico.dto';
import { UpdateProgramaAcademicoDto } from './dto/update-programa-academico.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../common/roles.guard';
import { Roles } from '../common/roles.decorator';

@UseGuards(JwtAuthGuard)
@Controller('programas-academicos')
export class ProgramasAcademicosController {
  constructor(private readonly programasAcademicosService: ProgramasAcademicosService) {}

  @Post()
  @UseGuards(RolesGuard)
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
  @UseGuards(RolesGuard)
  @Roles('admin')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProgramaAcademicoDto: UpdateProgramaAcademicoDto,
  ) {
    return this.programasAcademicosService.update(id, updateProgramaAcademicoDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.programasAcademicosService.remove(id);
  }
}
