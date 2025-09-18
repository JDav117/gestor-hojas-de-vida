import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Postulacion } from './postulacion.entity';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';

@Injectable()
export class PostulacionesService {
  constructor(
    @InjectRepository(Postulacion)
    private readonly postulacionRepository: Repository<Postulacion>,
  ) {}

  async create(createPostulacionDto: CreatePostulacionDto): Promise<Postulacion> {
    const postulacion = this.postulacionRepository.create(createPostulacionDto);
    return await this.postulacionRepository.save(postulacion);
  }

  async findAll(): Promise<Postulacion[]> {
    return this.postulacionRepository.find();
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
}
