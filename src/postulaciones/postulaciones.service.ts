import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Postulacion } from './postulacion.entity';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';

@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
  ) {}

  async create(createPostulacionDto: CreatePostulacionDto): Promise<Postulacion> {
    // Asegurar valores por defecto coherentes con el flujo actual
    const now = new Date();
    const postulacion = this.postulacionRepository.create({
      ...createPostulacionDto as any,
      estado: (createPostulacionDto as any).estado ?? 'borrador',
      fecha_postulacion: (createPostulacionDto as any).fecha_postulacion ?? now,
    } as Partial<Postulacion>);
    return await this.postulacionRepository.save(postulacion);
  }

  async findAll(): Promise<Postulacion[]> {
    return this.postulacionRepository.find();
  }

  async findFiltered(filters: { convocatoria_id?: number; estado?: string; postulante_id?: number; programa_id?: number }): Promise<Postulacion[]> {
    const where: any = {};
    if (typeof filters.postulante_id === 'number') where.postulante_id = filters.postulante_id;
    if (typeof filters.convocatoria_id === 'number') where.convocatoria_id = filters.convocatoria_id;
    if (typeof filters.programa_id === 'number') where.programa_id = filters.programa_id;
    if (filters.estado) where.estado = filters.estado;
    return this.postulacionRepository.find({ where });
  }

  async findAllForPostulante(postulanteId: number): Promise<Postulacion[]> {
    return this.postulacionRepository.find({ where: { postulante_id: postulanteId } });
  }

  async findByIds(ids: number[]): Promise<Postulacion[]> {
    if (!ids || ids.length === 0) return [];
    return this.postulacionRepository.find({ where: { id: In(ids) } });
  }

  async findOne(id: number): Promise<Postulacion | null> {
    return this.postulacionRepository.findOneBy({ id });
  }

  async update(id: number, updatePostulacionDto: any): Promise<Postulacion | null> {
    await this.postulacionRepository.update(id, updatePostulacionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.postulacionRepository.delete(id);
  }

  async findOrCreateDraft(postulanteId: number, convocatoriaId: number): Promise<Postulacion> {
    const existing = await this.postulacionRepository.findOne({ where: { postulante_id: postulanteId, convocatoria_id: convocatoriaId, estado: 'borrador' } });
    if (existing) return existing;
    const draft = this.postulacionRepository.create({
      postulante_id: postulanteId,
      convocatoria_id: convocatoriaId,
      programa_id: null as any,
      estado: 'borrador',
      fecha_postulacion: new Date(),
    } as Partial<Postulacion>);
    return await this.postulacionRepository.save(draft);
  }

  async submit(id: number, postulanteId: number): Promise<Postulacion> {
    const current = await this.findOne(id);
    if (!current) throw new Error('Postulación no encontrada');
    if (current.postulante_id !== postulanteId) throw new Error('No autorizado');
    if (!current.programa_id) throw new Error('Debes seleccionar un programa antes de enviar');
    current.estado = 'enviado';
    current.fecha_postulacion = new Date();
    await this.postulacionRepository.save(current);
    return current;
  }
}
