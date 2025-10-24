import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Postulacion } from './postulacion.entity';
import { PostulacionesService } from './postulaciones.service';
import { PostulacionesController } from './postulaciones.controller';
import { DocumentosModule } from '../documentos/documentos.module';
import { AsignacionesModule } from '../asignaciones/asignaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Postulacion]), forwardRef(() => DocumentosModule), AsignacionesModule],
  controllers: [PostulacionesController],
  providers: [PostulacionesService],
  exports: [PostulacionesService],
})
export class PostulacionesModule {}
