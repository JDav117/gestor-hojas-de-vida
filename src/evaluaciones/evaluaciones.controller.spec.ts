import { Test, TestingModule } from '@nestjs/testing';
import { EvaluacionesController } from './evaluaciones.controller';
import { EvaluacionesService } from './evaluaciones.service';
import { CreateEvaluacionDto } from './dto/create-evaluacion.dto';
import { UpdateEvaluacionDto } from './dto/update-evaluacion.dto';

const evaluacionesArray = [
  { id: 1, postulacion_id: 1, evaluador_id: 2, fecha: new Date('2025-09-01'), puntaje_total: 90 },
  { id: 2, postulacion_id: 2, evaluador_id: 3, fecha: new Date('2025-09-02'), puntaje_total: 85 },
];

const oneEvaluacion = evaluacionesArray[0];

const mockEvaluacionesService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => evaluacionesArray),
  findOne: jest.fn(id => evaluacionesArray.find(e => e.id === id)),
  update: jest.fn((id, dto) => ({ ...oneEvaluacion, ...dto })),
  remove: jest.fn(id => undefined),
};


const mockReq = {
  user: {
    userId: 10,
    roles: ['admin'],
  },
};

describe('EvaluacionesController', () => {
  let controller: EvaluacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EvaluacionesController],
      providers: [
        { provide: EvaluacionesService, useValue: mockEvaluacionesService },
      ],
    }).compile();

    controller = module.get<EvaluacionesController>(EvaluacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an evaluacion', async () => {
    const dto: CreateEvaluacionDto = {
      postulacion_id: 1,
      evaluador_id: 2,
      fecha: new Date('2025-09-10'),
      puntaje_total: 95,
    };

    expect(await controller.create(dto, mockReq)).toEqual({ id: 3, ...dto });
  });

  it('should return all evaluaciones', async () => {
    expect(await controller.findAll(mockReq)).toEqual(evaluacionesArray);
  });

  it('should return one evaluacion', async () => {
    expect(await controller.findOne(1, mockReq)).toEqual(oneEvaluacion);
  });

  it('should update an evaluacion', async () => {
    const dto: UpdateEvaluacionDto = { puntaje_total: 99 };
    expect(await controller.update(1, dto, mockReq)).toEqual({ ...oneEvaluacion, ...dto });
  });

  it('should remove an evaluacion', async () => {
    expect(await controller.remove(1, mockReq)).toBeUndefined();
  });
});
