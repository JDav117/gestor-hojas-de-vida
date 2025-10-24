import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EvaluacionesService } from './evaluaciones.service';
import { Evaluacion } from './evaluacion.entity';

const evaluacionesArray = [
  { id: 1, postulacion_id: 1, evaluador_id: 2, fecha: new Date('2025-09-01'), puntaje_total: 90 },
  { id: 2, postulacion_id: 2, evaluador_id: 3, fecha: new Date('2025-09-02'), puntaje_total: 85 },
];

const mockEvaluacionRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => evaluacionesArray),
  findOneBy: jest.fn(({ id }) => evaluacionesArray.find(e => e.id === id)),
  update: jest.fn((id, dto) => {
    const idx = evaluacionesArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      evaluacionesArray[idx] = { ...evaluacionesArray[idx], ...dto };
      return evaluacionesArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('EvaluacionesService', () => {
  let service: EvaluacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluacionesService,
        { provide: getRepositoryToken(Evaluacion), useValue: mockEvaluacionRepo },
      ],
    }).compile();

    service = module.get<EvaluacionesService>(EvaluacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an evaluacion', async () => {
    const dto = { postulacion_id: 1, evaluador_id: 2, fecha: new Date('2025-09-10'), puntaje_total: 95 };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all evaluaciones', async () => {
    expect(await service.findAll()).toEqual(evaluacionesArray);
  });

  it('should return one evaluacion', async () => {
    expect(await service.findOne(1)).toEqual(evaluacionesArray[0]);
  });

  it('should update an evaluacion', async () => {
    const dto = { puntaje_total: 99 };
    expect(await service.update(1, dto)).toEqual({ ...evaluacionesArray[0], ...dto });
  });

  it('should remove an evaluacion', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
