import { Controller, Post, Body, Delete, Param, ParseIntPipe, Get, UseGuards, Req } from '@nestjs/common';
import { AsignacionesService } from './asignaciones.service';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';
import { JwtRolesGuard } from '../common/jwt-roles.guard';
import { Roles } from '../common/roles.decorator';

@Controller('asignaciones')
export class AsignacionesController {
  constructor(private readonly asignacionesService: AsignacionesService) {}

  @Post()
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  create(@Body() dto: CreateAsignacionDto) {
    return this.asignacionesService.create(dto);
  }

  @Delete(':id')
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.asignacionesService.remove(id);
  }

  @Get()
  @UseGuards(JwtRolesGuard)
  @Roles('admin')
  findAll() {
    return this.asignacionesService.findAll();
  }

  @Get('me')
  @UseGuards(JwtRolesGuard)
  @Roles('admin','evaluador')
  async myAssignments(@Req() req: any) {
    const ids = await this.asignacionesService.getPostulacionIdsForEvaluador(Number(req.user?.userId));
    return ids;
  }
}
