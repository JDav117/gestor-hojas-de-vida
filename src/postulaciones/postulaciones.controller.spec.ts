import { Test, TestingModule } from '@nestjs/testing';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';

const postulacionesArray = [
  { id: 1, postulante_id: 1, convocatoria_id: 1, programa_id: 1, fecha_postulacion: new Date('2025-09-01'), disponibilidad_horaria: 'mañana' },
  { id: 2, postulante_id: 2, convocatoria_id: 1, programa_id: 2, fecha_postulacion: new Date('2025-09-02'), disponibilidad_horaria: 'tarde' },
];

const onePostulacion = postulacionesArray[0];

// Mock del servicio real
const mockPostulacionesService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => postulacionesArray),
  findOne: jest.fn(id => postulacionesArray.find(p => p.id === id)),
  update: jest.fn((id, dto) => ({ ...onePostulacion, ...dto })),
  remove: jest.fn(id => undefined),
};

// Mock del request con user
const mockReq = {
  user: {
    userId: 1,
    roles: ['admin']
  }
};

describe('PostulacionesController', () => {
  let controller: PostulacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PostulacionesController],
      providers: [
        { provide: PostulacionesService, useValue: mockPostulacionesService },
      ],
    }).compile();

    controller = module.get<PostulacionesController>(PostulacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a postulacion', async () => {
    const dto: CreatePostulacionDto = {
      postulante_id: 1,
      convocatoria_id: 1,
      programa_id: 1,
      fecha_postulacion: new Date('2025-09-10'),
      disponibilidad_horaria: 'mañana',
    };

    expect(await controller.create(dto, mockReq)).toEqual({ id: 3, ...dto });
  });

  it('should return all postulaciones', async () => {
    expect(await controller.findAll(mockReq)).toEqual(postulacionesArray);
   });

  it('should return one postulacion', async () => {
  const mockReq = { user: { userId: 1, roles: ['admin'] } };
  expect(await controller.findOne(1, mockReq)).toEqual(onePostulacion);
   });

  it('should update a postulacion', async () => {
    const dto: UpdatePostulacionDto = { disponibilidad_horaria: 'tarde' };
    expect(await controller.update(1, dto, mockReq)).toEqual({ ...onePostulacion, ...dto });
   });

  it('should remove a postulacion', async () => {
    expect(await controller.remove(1, mockReq)).toBeUndefined();
   });
  });

