import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConvocatoriasService } from './convocatorias.service';
import { Convocatoria } from './convocatoria.entity';

const convocatoriasArray = [
  { id: 1, nombre: 'Convocatoria 1', fecha_apertura: new Date('2025-09-01'), fecha_cierre: new Date('2025-09-30'), estado: 'abierta' },
  { id: 2, nombre: 'Convocatoria 2', fecha_apertura: new Date('2025-10-01'), fecha_cierre: new Date('2025-10-31'), estado: 'cerrada' },
];

const mockConvocatoriaRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => convocatoriasArray),
  findOneBy: jest.fn(({ id }) => convocatoriasArray.find(c => c.id === id)),
  update: jest.fn((id, dto) => {
    const idx = convocatoriasArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      convocatoriasArray[idx] = { ...convocatoriasArray[idx], ...dto };
      return convocatoriasArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('ConvocatoriasService', () => {
  let service: ConvocatoriasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConvocatoriasService,
        { provide: getRepositoryToken(Convocatoria), useValue: mockConvocatoriaRepo },
      ],
    }).compile();

    service = module.get<ConvocatoriasService>(ConvocatoriasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a convocatoria', async () => {
    const dto = { nombre: 'Nueva', fecha_apertura: new Date('2025-11-01'), fecha_cierre: new Date('2025-11-30'), estado: 'abierta' };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all convocatorias', async () => {
    expect(await service.findAll()).toEqual(convocatoriasArray);
  });

  it('should return one convocatoria', async () => {
    expect(await service.findOne(1)).toEqual(convocatoriasArray[0]);
  });

  it('should update a convocatoria', async () => {
    const dto = { estado: 'cerrada' };
    expect(await service.update(1, dto)).toEqual({ ...convocatoriasArray[0], ...dto });
  });

  it('should remove a convocatoria', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
