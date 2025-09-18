import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ItemsEvaluacionService } from './items-evaluacion.service';
import { ItemEvaluacion } from './item-evaluacion.entity';

const itemsArray = [
  { id: 1, nombre_item: 'Experiencia', descripcion: 'Años de experiencia' },
  { id: 2, nombre_item: 'Titulación', descripcion: 'Nivel académico' },
];

const mockItemRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => itemsArray),
  findOneBy: jest.fn(({ id }) => itemsArray.find(i => i.id === id)),
  update: jest.fn((id, dto) => {
    const idx = itemsArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      itemsArray[idx] = { ...itemsArray[idx], ...dto };
      return itemsArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('ItemsEvaluacionService', () => {
  let service: ItemsEvaluacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ItemsEvaluacionService,
        { provide: getRepositoryToken(ItemEvaluacion), useValue: mockItemRepo },
      ],
    }).compile();

    service = module.get<ItemsEvaluacionService>(ItemsEvaluacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an item', async () => {
    const dto = { nombre_item: 'Nuevo', descripcion: 'Descripción' };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all items', async () => {
    expect(await service.findAll()).toEqual(itemsArray);
  });

  it('should return one item', async () => {
    expect(await service.findOne(1)).toEqual(itemsArray[0]);
  });

  it('should update an item', async () => {
    const dto = { nombre_item: 'Editado' };
    expect(await service.update(1, dto)).toEqual({ ...itemsArray[0], ...dto });
  });

  it('should remove an item', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
