import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaremoConvocatoria } from './baremo-convocatoria.entity';
import { CreateBaremoConvocatoriaDto } from './dto/create-baremo-convocatoria.dto';
import { UpdateBaremoConvocatoriaDto } from './dto/update-baremo-convocatoria.dto';

@Injectable()
export class BaremoConvocatoriaService {
  constructor(
    @InjectRepository(BaremoConvocatoria)
    private readonly baremoConvocatoriaRepository: Repository<BaremoConvocatoria>,
  ) {}

  async create(createBaremoConvocatoriaDto: CreateBaremoConvocatoriaDto): Promise<BaremoConvocatoria> {
    const baremo = this.baremoConvocatoriaRepository.create(createBaremoConvocatoriaDto);
    return this.baremoConvocatoriaRepository.save(baremo);
  }

  async findAll(): Promise<BaremoConvocatoria[]> {
    return this.baremoConvocatoriaRepository.find();
  }

  async findOne(id: number): Promise<BaremoConvocatoria | null> {
    return this.baremoConvocatoriaRepository.findOneBy({ id });
  }

  async update(
    id: number,
    updateBaremoConvocatoriaDto: UpdateBaremoConvocatoriaDto,
  ): Promise<BaremoConvocatoria | null> {
    await this.baremoConvocatoriaRepository.update(id, updateBaremoConvocatoriaDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.baremoConvocatoriaRepository.delete(id);
  }
}
