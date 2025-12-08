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

  async findByConvocatoria(convocatoriaId: number): Promise<any[]> {
    const results = await this.baremoConvocatoriaRepository
      .createQueryBuilder('baremo')
      .leftJoinAndSelect('items_evaluacion', 'item', 'baremo.item_evaluacion_id = item.id')
      .where('baremo.convocatoria_id = :convocatoriaId', { convocatoriaId })
      .select([
        'baremo.id as id',
        'baremo.convocatoria_id as convocatoria_id',
        'baremo.item_evaluacion_id as item_evaluacion_id',
        'baremo.puntaje_maximo as puntaje_maximo',
        'item.nombre_item as nombre_item',
        'item.descripcion as descripcion'
      ])
      .getRawMany();
    
    return results;
  }
}
