import { Module, forwardRef } from '@nestjs/common';
import { DocumentosService } from './documentos.service';
import { DocumentosController } from './documentos.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Documento } from './documento.entity';
import { PostulacionesModule } from '../postulaciones/postulaciones.module';

@Module({
  imports: [TypeOrmModule.forFeature([Documento]), forwardRef(() => PostulacionesModule)],
  controllers: [DocumentosController],
  providers: [DocumentosService],
  exports: [DocumentosService],
})
export class DocumentosModule {}
