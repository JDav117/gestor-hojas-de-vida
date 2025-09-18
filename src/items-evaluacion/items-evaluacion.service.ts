import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ItemEvaluacion } from './item-evaluacion.entity';
import { CreateItemEvaluacionDto } from './dto/create-item-evaluacion.dto';

@Injectable()
export class ItemsEvaluacionService {
  constructor(
    @InjectRepository(ItemEvaluacion)
    private readonly itemEvaluacionRepository: Repository<ItemEvaluacion>,
  ) {}
  
  async create(createItemEvaluacionDto: CreateItemEvaluacionDto): Promise<ItemEvaluacion> {
    const item = this.itemEvaluacionRepository.create(createItemEvaluacionDto);
    return await this.itemEvaluacionRepository.save(item);
  }

  async findAll(): Promise<ItemEvaluacion[]> {
    return this.itemEvaluacionRepository.find();
  }

  async findOne(id: number): Promise<ItemEvaluacion | null> {
    return this.itemEvaluacionRepository.findOneBy({ id });
  }

  async update(id: number, updateItemEvaluacionDto: any): Promise<ItemEvaluacion | null> {
    await this.itemEvaluacionRepository.update(id, updateItemEvaluacionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.itemEvaluacionRepository.delete(id);
  }
}
