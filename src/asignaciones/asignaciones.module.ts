import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { Asignacion } from './asignacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Asignacion])],
  providers: [AsignacionesService],
  controllers: [AsignacionesController],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
