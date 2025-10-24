import { Test, TestingModule } from '@nestjs/testing';
import { ProgramasAcademicosController } from './programas-academicos.controller';
import { ProgramasAcademicosService } from './programas-academicos.service';
import { CreateProgramaAcademicoDto } from './dto/create-programa-academico.dto';
import { UpdateProgramaAcademicoDto } from './dto/update-programa-academico.dto';

const programasArray = [
  { id: 1, nombre_programa: 'Ingeniería de Sistemas' },
  { id: 2, nombre_programa: 'Matemáticas' },
];

const onePrograma = programasArray[0];

const mockProgramasAcademicosService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => programasArray),
  findOne: jest.fn(id => programasArray.find(p => p.id === id)),
  update: jest.fn((id, dto) => ({ ...onePrograma, ...dto })),
  remove: jest.fn(id => undefined),
};

describe('ProgramasAcademicosController', () => {
  let controller: ProgramasAcademicosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgramasAcademicosController],
      providers: [
        { provide: ProgramasAcademicosService, useValue: mockProgramasAcademicosService },
      ],
    }).compile();

    controller = module.get<ProgramasAcademicosController>(ProgramasAcademicosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a programa academico', async () => {
    const dto: CreateProgramaAcademicoDto = {
      nombre_programa: 'Física',
    };
    expect(await controller.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all programas', async () => {
    expect(await controller.findAll()).toEqual(programasArray);
  });

  it('should return one programa', async () => {
    expect(await controller.findOne(1)).toEqual(onePrograma);
  });

  it('should update a programa', async () => {
    const dto: UpdateProgramaAcademicoDto = { nombre_programa: 'Química' };
    expect(await controller.update(1, dto)).toEqual({ ...onePrograma, ...dto });
  });

  it('should remove a programa', async () => {
    expect(await controller.remove(1)).toBeUndefined();
  });
});
