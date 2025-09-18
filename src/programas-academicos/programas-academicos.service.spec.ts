import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ProgramasAcademicosService } from './programas-academicos.service';
import { ProgramaAcademico } from './programa-academico.entity';

const programasArray = [
  { id: 1, nombre_programa: 'Ingeniería de Sistemas' },
  { id: 2, nombre_programa: 'Matemáticas' },
];

const mockProgramaRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => programasArray),
  findOneBy: jest.fn(({ id }) => programasArray.find(p => p.id === id)),
  update: jest.fn((id, dto) => {
    const idx = programasArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      programasArray[idx] = { ...programasArray[idx], ...dto };
      return programasArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('ProgramasAcademicosService', () => {
  let service: ProgramasAcademicosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProgramasAcademicosService,
        { provide: getRepositoryToken(ProgramaAcademico), useValue: mockProgramaRepo },
      ],
    }).compile();

    service = module.get<ProgramasAcademicosService>(ProgramasAcademicosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a programa academico', async () => {
    const dto = { nombre_programa: 'Física' };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all programas', async () => {
    expect(await service.findAll()).toEqual(programasArray);
  });

  it('should return one programa', async () => {
    expect(await service.findOne(1)).toEqual(programasArray[0]);
  });

  it('should update a programa', async () => {
    const dto = { nombre_programa: 'Química' };
    expect(await service.update(1, dto)).toEqual({ ...programasArray[0], ...dto });
  });

  it('should remove a programa', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
