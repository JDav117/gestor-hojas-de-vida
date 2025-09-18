import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BaremoConvocatoriaService } from './baremo-convocatoria.service';
import { BaremoConvocatoria } from './baremo-convocatoria.entity';

const baremosArray = [
  { id: 1, convocatoria_id: 1, item_evaluacion_id: 2, puntaje_maximo: 30 },
  { id: 2, convocatoria_id: 1, item_evaluacion_id: 3, puntaje_maximo: 20 },
];

const mockBaremoRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => baremosArray),
  findOneBy: jest.fn(({ id }) => baremosArray.find(b => b.id === id)),
  update: jest.fn((id, dto) => {
    const idx = baremosArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      baremosArray[idx] = { ...baremosArray[idx], ...dto };
      return baremosArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('BaremoConvocatoriaService', () => {
  let service: BaremoConvocatoriaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BaremoConvocatoriaService,
        { provide: getRepositoryToken(BaremoConvocatoria), useValue: mockBaremoRepo },
      ],
    }).compile();

    service = module.get<BaremoConvocatoriaService>(BaremoConvocatoriaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a baremo', async () => {
    const dto = { convocatoria_id: 1, item_evaluacion_id: 2, puntaje_maximo: 50 };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all baremos', async () => {
    expect(await service.findAll()).toEqual(baremosArray);
  });

  it('should return one baremo', async () => {
    expect(await service.findOne(1)).toEqual(baremosArray[0]);
  });

  it('should update a baremo', async () => {
    const dto = { puntaje_maximo: 60 };
    expect(await service.update(1, dto)).toEqual({ ...baremosArray[0], ...dto });
  });

  it('should remove a baremo', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
