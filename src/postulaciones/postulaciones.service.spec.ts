import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PostulacionesService } from './postulaciones.service';
import { Postulacion } from './postulacion.entity';

const postulacionesArray = [
  { id: 1, postulante_id: 1, convocatoria_id: 1, programa_id: 1, fecha_postulacion: new Date('2025-09-01'), estado: 'pendiente', disponibilidad_horaria: 'mañana' },
  { id: 2, postulante_id: 2, convocatoria_id: 1, programa_id: 2, fecha_postulacion: new Date('2025-09-02'), estado: 'aceptada', disponibilidad_horaria: 'tarde' },
];

const mockPostulacionRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => postulacionesArray),
  findOneBy: jest.fn(({ id }) => postulacionesArray.find(p => p.id === id)),
  update: jest.fn((id, dto) => {
    const idx = postulacionesArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      postulacionesArray[idx] = { ...postulacionesArray[idx], ...dto };
      return postulacionesArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('PostulacionesService', () => {
  let service: PostulacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostulacionesService,
        { provide: getRepositoryToken(Postulacion), useValue: mockPostulacionRepo },
      ],
    }).compile();

    service = module.get<PostulacionesService>(PostulacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a postulacion', async () => {
    const dto = { postulante_id: 1, convocatoria_id: 1, programa_id: 1, fecha_postulacion: new Date('2025-09-10'), estado: 'pendiente', disponibilidad_horaria: 'mañana' };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all postulaciones', async () => {
    expect(await service.findAll()).toEqual(postulacionesArray);
  });

  it('should return one postulacion', async () => {
    expect(await service.findOne(1)).toEqual(postulacionesArray[0]);
  });

  it('should update a postulacion', async () => {
    const dto = { estado: 'aceptada' };
    expect(await service.update(1, dto)).toEqual({ ...postulacionesArray[0], ...dto });
  });

  it('should remove a postulacion', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
