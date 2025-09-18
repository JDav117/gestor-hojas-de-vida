import { Test, TestingModule } from '@nestjs/testing';
import { BaremoConvocatoriaController } from './baremo-convocatoria.controller';
import { BaremoConvocatoriaService } from './baremo-convocatoria.service';
import { CreateBaremoConvocatoriaDto } from './dto/create-baremo-convocatoria.dto';
import { UpdateBaremoConvocatoriaDto } from './dto/update-baremo-convocatoria.dto';

const baremosArray = [
  { id: 1, convocatoria_id: 1, item_evaluacion_id: 2, puntaje_maximo: 30 },
  { id: 2, convocatoria_id: 1, item_evaluacion_id: 3, puntaje_maximo: 20 },
];

const oneBaremo = baremosArray[0];

const mockBaremoConvocatoriaService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => baremosArray),
  findOne: jest.fn(id => baremosArray.find(b => b.id === id)),
  update: jest.fn((id, dto) => ({ ...oneBaremo, ...dto })),
  remove: jest.fn(id => undefined),
};

describe('BaremoConvocatoriaController', () => {
  let controller: BaremoConvocatoriaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BaremoConvocatoriaController],
      providers: [
        { provide: BaremoConvocatoriaService, useValue: mockBaremoConvocatoriaService },
      ],
    }).compile();

    controller = module.get<BaremoConvocatoriaController>(BaremoConvocatoriaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a baremo', async () => {
    const dto: CreateBaremoConvocatoriaDto = {
      convocatoria_id: 1,
      item_evaluacion_id: 2,
      puntaje_maximo: 50,
    };
    expect(await controller.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all baremos', async () => {
    expect(await controller.findAll()).toEqual(baremosArray);
  });

  it('should return one baremo', async () => {
    expect(await controller.findOne(1)).toEqual(oneBaremo);
  });

  it('should update a baremo', async () => {
    const dto: UpdateBaremoConvocatoriaDto = { puntaje_maximo: 60 };
    expect(await controller.update(1, dto)).toEqual({ ...oneBaremo, ...dto });
  });

  it('should remove a baremo', async () => {
    expect(await controller.remove(1)).toBeUndefined();
  });
});
