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

  private calcularEstado(fecha_apertura: Date, fecha_cierre: Date, now: Date = new Date()): string {
    const ap = new Date(fecha_apertura).getTime();
    const ci = new Date(fecha_cierre).getTime();
    const n = now.getTime();
    if (Number.isNaN(ap) || Number.isNaN(ci)) return 'borrador';
    if (n < ap) return 'borrador';
    if (n > ci) return 'cerrada';
    return 'publicada';
  }

  async create(createConvocatoriaDto: CreateConvocatoriaDto): Promise<Convocatoria> {
    const partial: Partial<Convocatoria> = {
      nombre: createConvocatoriaDto.nombre,
      descripcion: (createConvocatoriaDto as any).descripcion ?? null,
      fecha_apertura: createConvocatoriaDto.fecha_apertura,
      fecha_cierre: createConvocatoriaDto.fecha_cierre,
    };
    partial.estado = this.calcularEstado(partial.fecha_apertura!, partial.fecha_cierre!);
    const convocatoria = this.convocatoriaRepository.create(partial);
    return await this.convocatoriaRepository.save(convocatoria);
  }

  async findAll(): Promise<Convocatoria[]> {
    return this.convocatoriaRepository.find();
  }

  async findOne(id: number): Promise<Convocatoria | null> {
    return this.convocatoriaRepository.findOneBy({ id });
  }

  async update(id: number, updateConvocatoriaDto: any): Promise<Convocatoria | null> {
    // Ignorar "estado" recibido: siempre recalculamos
    const current = await this.findOne(id);
    if (!current) return null;
    const next: Partial<Convocatoria> = {
      nombre: updateConvocatoriaDto.nombre ?? current.nombre,
      descripcion: updateConvocatoriaDto.descripcion ?? current.descripcion ?? null,
      fecha_apertura: updateConvocatoriaDto.fecha_apertura ? new Date(updateConvocatoriaDto.fecha_apertura) : current.fecha_apertura,
      fecha_cierre: updateConvocatoriaDto.fecha_cierre ? new Date(updateConvocatoriaDto.fecha_cierre) : current.fecha_cierre,
    };
    next.estado = this.calcularEstado(next.fecha_apertura!, next.fecha_cierre!);
    await this.convocatoriaRepository.update(id, next);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.convocatoriaRepository.delete(id);
  }
}
