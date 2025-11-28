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
      fechaPostulacion: (createPostulacionDto as any).fecha_postulacion ?? now,
    } as Partial<Postulacion>);
    return await this.postulacionRepository.save(postulacion);
  }

  async findAll(): Promise<Postulacion[]> {
    return this.postulacionRepository.find();
  }

  async findFiltered(filters: { convocatoria_id?: number; estado?: string; postulante_id?: number; programa_id?: number }): Promise<Postulacion[]> {
    const where: any = {};
    if (typeof filters.postulante_id === 'number') where.postulante = { id: filters.postulante_id };
    if (typeof filters.convocatoria_id === 'number') where.convocatoria = { id: filters.convocatoria_id };
    if (typeof filters.programa_id === 'number') where.programa = { id: filters.programa_id };
    if (filters.estado) where.estado = filters.estado;
    return this.postulacionRepository.find({ where });
  }

  async findAllForPostulante(postulanteId: number): Promise<Postulacion[]> {
    return this.postulacionRepository.find({ where: { postulante: { id: postulanteId } } });
  }

  async findByIds(ids: number[]): Promise<Postulacion[]> {
    if (!ids || ids.length === 0) return [];
    return this.postulacionRepository.find({ where: { id: In(ids) } });
  }

  async findOne(id: number): Promise<Postulacion | null> {
    return this.postulacionRepository.findOne({ 
      where: { id },
      relations: ['postulante', 'convocatoria', 'convocatoria.programa', 'programa']
    });
  }

  async update(id: number, updatePostulacionDto: any): Promise<Postulacion | null> {
    await this.postulacionRepository.update(id, updatePostulacionDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.postulacionRepository.delete(id);
  }

  async findOrCreateDraft(postulanteId: number, convocatoriaId: number): Promise<Postulacion> {
    const existing = await this.postulacionRepository.findOne({ where: { postulante: { id: postulanteId }, convocatoria: { id: convocatoriaId }, estado: 'borrador' } });
    if (existing) return existing;
    const draft = this.postulacionRepository.create({
      postulante: { id: postulanteId } as any,
      convocatoria: { id: convocatoriaId } as any,
      programa: null as any,
      estado: 'borrador',
      fechaPostulacion: new Date(),
    } as Partial<Postulacion>);
    return await this.postulacionRepository.save(draft);
  }

  async submit(id: number, postulanteId: number): Promise<Postulacion> {
    const current = await this.postulacionRepository.findOne({ where: { id } });
    if (!current) throw new Error('Postulación no encontrada');
    if (current.postulante_id !== postulanteId) throw new Error('No autorizado para enviar esta postulación');
    if (current.estado !== 'borrador') throw new Error('Solo se pueden enviar postulaciones en borrador');
    if (!current.programa_id) throw new Error('Debes seleccionar un programa académico antes de enviar');
    current.estado = 'enviada';
    current.submitted_at = new Date();
    await this.postulacionRepository.save(current);
    return current;
  }
}
