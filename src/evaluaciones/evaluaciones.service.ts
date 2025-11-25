import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Evaluacion } from './evaluacion.entity';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

@Injectable()
export class EvaluacionesService {
  constructor(
    @InjectRepository(Evaluacion)
    private readonly evaluacionRepository: Repository<Evaluacion>,
  ) {}

  async create(createEvaluacionDto: CreateEvaluacionDto): Promise<Evaluacion> {
    const evaluacion = this.evaluacionRepository.create(createEvaluacionDto);
    return this.evaluacionRepository.save(evaluacion);
  }

  async findAll(): Promise<Evaluacion[]> {
    return this.evaluacionRepository.find();
  }

  async findOne(id: number): Promise<Evaluacion | null> {
    return this.evaluacionRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateEvaluacionDto: UpdateEvaluacionDto,
  ): Promise<Evaluacion | null> {
    await this.evaluacionRepository.update(id, updateEvaluacionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.evaluacionRepository.delete(id);
  }

async findByEvaluador(evaluadorId: number): Promise<Evaluacion[]> {
  return this.evaluacionRepository.find({
    where: { evaluador_id: evaluadorId },
  });
}
}
