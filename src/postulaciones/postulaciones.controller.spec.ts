import { Test, TestingModule } from '@nestjs/testing';
import { PostulacionesController } from './postulaciones.controller';
import { PostulacionesService } from './postulaciones.service';
import { CreatePostulacionDto } from './dto/create-postulacion.dto';
import { UpdatePostulacionDto } from './dto/update-postulacion.dto';

const postulacionesArray = [
  { id: 1, postulante_id: 1, convocatoria_id: 1, programa_id: 1, fecha_postulacion: new Date('2025-09-01'), estado: 'pendiente', disponibilidad_horaria: 'mañana' },
  { id: 2, postulante_id: 2, convocatoria_id: 1, programa_id: 2, fecha_postulacion: new Date('2025-09-02'), estado: 'aceptada', disponibilidad_horaria: 'tarde' },
];

const onePostulacion = postulacionesArray[0];

const mockPostulacionesService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => postulacionesArray),
  findOne: jest.fn(id => postulacionesArray.find(p => p.id === id)),
  update: jest.fn((id, dto) => ({ ...onePostulacion, ...dto })),
  remove: jest.fn(id => undefined),
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
      estado: 'pendiente',
      disponibilidad_horaria: 'mañana',
    };
    expect(await controller.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all postulaciones', async () => {
    expect(await controller.findAll()).toEqual(postulacionesArray);
  });

  it('should return one postulacion', async () => {
    expect(await controller.findOne(1)).toEqual(onePostulacion);
  });

  it('should update a postulacion', async () => {
    const dto: UpdatePostulacionDto = { estado: 'aceptada' };
    const req = { user: { userId: 1, roles: ['admin'] } };
    expect(await controller.update(1, dto, req)).toEqual({ ...onePostulacion, ...dto });
  });

  it('should remove a postulacion', async () => {
    const req = { user: { userId: 1, roles: ['admin'] } };
    expect(await controller.remove(1, req)).toBeUndefined();
  });
});
