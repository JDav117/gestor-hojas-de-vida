import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Convocatoria } from './convocatoria.entity';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';

@Injectable()
export class ConvocatoriasService {
  constructor(
    @InjectRepository(Convocatoria)
    private readonly convocatoriaRepository: Repository<Convocatoria>,
  ) {}

  async create(createConvocatoriaDto: CreateConvocatoriaDto): Promise<Convocatoria> {
    const convocatoria = this.convocatoriaRepository.create(createConvocatoriaDto);
    return await this.convocatoriaRepository.save(convocatoria);
  }

  async findAll(): Promise<Convocatoria[]> {
    return this.convocatoriaRepository.find();
  }

  async findOne(id: number): Promise<Convocatoria | null> {
    return this.convocatoriaRepository.findOneBy({ id });
  }

  async update(id: number, updateConvocatoriaDto: any): Promise<Convocatoria | null> {
    await this.convocatoriaRepository.update(id, updateConvocatoriaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.convocatoriaRepository.delete(id);
  }
}
