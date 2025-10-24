import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProgramaAcademico } from './programa-academico.entity';
import { ProgramasAcademicosService } from './programas-academicos.service';
import { ProgramasAcademicosController } from './programas-academicos.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ProgramaAcademico])],
  controllers: [ProgramasAcademicosController],
  providers: [ProgramasAcademicosService],
  exports: [ProgramasAcademicosService],
})
export class ProgramasAcademicosModule {}
