import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Asignacion } from './asignacion.entity';
import { CreateAsignacionDto } from './dto/create-asignacion.dto';

@Injectable()
export class AsignacionesService {
  constructor(
    @InjectRepository(Asignacion)
    private readonly asignacionRepository: Repository<Asignacion>,
  ) {}

  async create(dto: CreateAsignacionDto): Promise<Asignacion> {
    const existing = await this.asignacionRepository.findOne({ where: { evaluador_id: dto.evaluador_id, postulacion_id: dto.postulacion_id } });
    if (existing) throw new BadRequestException('La asignación ya existe');
    const asignacion = this.asignacionRepository.create(dto);
    return this.asignacionRepository.save(asignacion);
  }

  async remove(id: number): Promise<void> {
    await this.asignacionRepository.delete(id);
  }

  async findAll(): Promise<Asignacion[]> {
    return this.asignacionRepository.find();
  }

  async findByEvaluador(evaluadorId: number): Promise<Asignacion[]> {
    return this.asignacionRepository.find({ where: { evaluador_id: evaluadorId } });
  }

  async isAssigned(evaluadorId: number, postulacionId: number): Promise<boolean> {
    const a = await this.asignacionRepository.findOne({ where: { evaluador_id: evaluadorId, postulacion_id: postulacionId } });
    return !!a;
  }

  async getPostulacionIdsForEvaluador(evaluadorId: number): Promise<number[]> {
    const list = await this.findByEvaluador(evaluadorId);
    return list.map(a => a.postulacion_id);
  }
}
