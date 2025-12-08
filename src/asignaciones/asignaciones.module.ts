import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AsignacionesService } from './asignaciones.service';
import { AsignacionesController } from './asignaciones.controller';
import { Asignacion } from './asignacion.entity';
import { PostulacionesModule } from '../postulaciones/postulaciones.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Asignacion]),
    forwardRef(() => PostulacionesModule)
  ],
  providers: [AsignacionesService],
  controllers: [AsignacionesController],
  exports: [AsignacionesService],
})
export class AsignacionesModule {}
