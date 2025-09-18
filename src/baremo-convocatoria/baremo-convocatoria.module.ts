import { Module } from '@nestjs/common';
import { BaremoConvocatoriaService } from './baremo-convocatoria.service';
import { BaremoConvocatoriaController } from './baremo-convocatoria.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BaremoConvocatoria } from './baremo-convocatoria.entity';
import { ItemsEvaluacionModule } from '../items-evaluacion/items-evaluacion.module';
import { ConvocatoriasModule } from '../convocatorias/convocatorias.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BaremoConvocatoria]),
    ItemsEvaluacionModule,
    ConvocatoriasModule,
  ],
  controllers: [BaremoConvocatoriaController],
  providers: [BaremoConvocatoriaService],
  exports: [BaremoConvocatoriaService],
})
export class BaremoConvocatoriaModule {}
