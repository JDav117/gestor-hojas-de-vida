import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Documento } from './documento.entity';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private readonly documentoRepository: Repository<Documento>,
  ) {}

  async create(createDocumentoDto: CreateDocumentoDto): Promise<Documento> {
    const documento = this.documentoRepository.create(createDocumentoDto);
    return this.documentoRepository.save(documento);
  }

  async findAll(): Promise<Documento[]> {
    return this.documentoRepository.find();
  }

  async findOne(id: number): Promise<Documento | null> {
    return this.documentoRepository.findOneBy({ id });
  }

  async findByPostulacionIds(postulacionIds: number[]): Promise<Documento[]> {
    if (!postulacionIds || postulacionIds.length === 0) return [];
    return this.documentoRepository.find({
      where: { postulacion_id: In(postulacionIds) },
    });
  }

  async update(
    id: number,
    updateDocumentoDto: UpdateDocumentoDto,
  ): Promise<Documento | null> {
    await this.documentoRepository.update(id, updateDocumentoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.documentoRepository.delete(id);
  }
}
