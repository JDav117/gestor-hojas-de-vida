import { Test, TestingModule } from '@nestjs/testing';
import { ConvocatoriasController } from './convocatorias.controller';
import { ConvocatoriasService } from './convocatorias.service';
import { CreateConvocatoriaDto } from './dto/create-convocatoria.dto';
import { UpdateConvocatoriaDto } from './dto/update-convocatoria.dto';

const convocatoriasArray = [
  { id: 1, nombre: 'Convocatoria 1', fecha_apertura: new Date('2025-09-01'), fecha_cierre: new Date('2025-09-30'), estado: 'abierta' },
  { id: 2, nombre: 'Convocatoria 2', fecha_apertura: new Date('2025-10-01'), fecha_cierre: new Date('2025-10-31'), estado: 'cerrada' },
];

const oneConvocatoria = convocatoriasArray[0];

const mockConvocatoriasService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => convocatoriasArray),
  findOne: jest.fn(id => convocatoriasArray.find(c => c.id === id)),
  update: jest.fn((id, dto) => ({ ...oneConvocatoria, ...dto })),
  remove: jest.fn(id => undefined),
};

describe('ConvocatoriasController', () => {
  let controller: ConvocatoriasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConvocatoriasController],
      providers: [
        { provide: ConvocatoriasService, useValue: mockConvocatoriasService },
      ],
    }).compile();

    controller = module.get<ConvocatoriasController>(ConvocatoriasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a convocatoria', async () => {
    const dto: CreateConvocatoriaDto = {
      nombre: 'Nueva',
      fecha_apertura: new Date('2025-11-01'),
      fecha_cierre: new Date('2025-11-30'),
      estado: 'abierta',
    };
    expect(await controller.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all convocatorias', async () => {
    expect(await controller.findAll()).toEqual(convocatoriasArray);
  });

  it('should return one convocatoria', async () => {
    expect(await controller.findOne(1)).toEqual(oneConvocatoria);
  });

  it('should update a convocatoria', async () => {
    const dto: UpdateConvocatoriaDto = { estado: 'cerrada' };
    expect(await controller.update(1, dto)).toEqual({ ...oneConvocatoria, ...dto });
  });

  it('should remove a convocatoria', async () => {
    expect(await controller.remove(1)).toBeUndefined();
  });
});
