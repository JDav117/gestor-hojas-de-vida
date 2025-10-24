import { Module } from '@nestjs/common';
import { ItemsEvaluacionService } from './items-evaluacion.service';
import { ItemsEvaluacionController } from './items-evaluacion.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ItemEvaluacion } from './item-evaluacion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ItemEvaluacion])],
  controllers: [ItemsEvaluacionController],
  providers: [ItemsEvaluacionService],
  exports: [ItemsEvaluacionService],
})
export class ItemsEvaluacionModule {}
