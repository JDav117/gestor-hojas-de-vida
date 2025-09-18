import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Convocatoria } from './convocatoria.entity';
import { ConvocatoriasService } from './convocatorias.service';
import { ConvocatoriasController } from './convocatorias.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Convocatoria])],
  controllers: [ConvocatoriasController],
  providers: [ConvocatoriasService],
  exports: [ConvocatoriasService],
})
export class ConvocatoriasModule {}
