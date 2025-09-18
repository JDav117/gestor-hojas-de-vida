import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProgramaAcademico } from './programa-academico.entity';
import { CreateProgramaAcademicoDto } from './dto/create-programa-academico.dto';

@Injectable()
export class ProgramasAcademicosService {
  constructor(
    @InjectRepository(ProgramaAcademico)
    private readonly programaAcademicoRepository: Repository<ProgramaAcademico>,
  ) {}

  async create(createProgramaAcademicoDto: CreateProgramaAcademicoDto): Promise<ProgramaAcademico> {
    const programa = this.programaAcademicoRepository.create(createProgramaAcademicoDto);
    return await this.programaAcademicoRepository.save(programa);
  }

  async findAll(): Promise<ProgramaAcademico[]> {
    return this.programaAcademicoRepository.find();
  }

  async findOne(id: number): Promise<ProgramaAcademico | null> {
    return this.programaAcademicoRepository.findOneBy({ id });
  }

  async update(id: number, updateProgramaAcademicoDto: any): Promise<ProgramaAcademico | null> {
    await this.programaAcademicoRepository.update(id, updateProgramaAcademicoDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.programaAcademicoRepository.delete(id);
  }
}
