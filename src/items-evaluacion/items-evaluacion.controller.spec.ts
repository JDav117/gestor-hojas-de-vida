import { Test, TestingModule } from '@nestjs/testing';
import { ItemsEvaluacionController } from './items-evaluacion.controller';
import { ItemsEvaluacionService } from './items-evaluacion.service';
import { CreateItemEvaluacionDto } from './dto/create-item-evaluacion.dto';
import { UpdateItemEvaluacionDto } from './dto/update-item-evaluacion.dto';

const itemsArray = [
  { id: 1, nombre_item: 'Experiencia', descripcion: 'Años de experiencia' },
  { id: 2, nombre_item: 'Titulación', descripcion: 'Nivel académico' },
];

const oneItem = itemsArray[0];

const mockItemsEvaluacionService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => itemsArray),
  findOne: jest.fn(id => itemsArray.find(i => i.id === id)),
  update: jest.fn((id, dto) => ({ ...oneItem, ...dto })),
  remove: jest.fn(id => undefined),
};

describe('ItemsEvaluacionController', () => {
  let controller: ItemsEvaluacionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ItemsEvaluacionController],
      providers: [
        { provide: ItemsEvaluacionService, useValue: mockItemsEvaluacionService },
      ],
    }).compile();

    controller = module.get<ItemsEvaluacionController>(ItemsEvaluacionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create an item', async () => {
    const dto: CreateItemEvaluacionDto = {
      nombre_item: 'Nuevo',
      descripcion: 'Descripción',
    };
    expect(await controller.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all items', async () => {
    expect(await controller.findAll()).toEqual(itemsArray);
  });

  it('should return one item', async () => {
    expect(await controller.findOne(1)).toEqual(oneItem);
  });

  it('should update an item', async () => {
    const dto: UpdateItemEvaluacionDto = { nombre_item: 'Editado' };
    expect(await controller.update(1, dto)).toEqual({ ...oneItem, ...dto });
  });

  it('should remove an item', async () => {
    expect(await controller.remove(1)).toBeUndefined();
  });
});
