import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { PostulacionesService } from '../postulaciones/postulaciones.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';

const documentoArray = [
  { id: 1, postulacion_id: 1, nombre_documento: 'CV.pdf', ruta_archivo: '/files/cv.pdf' },
  { id: 2, postulacion_id: 2, nombre_documento: 'Certificado.pdf', ruta_archivo: '/files/certificado.pdf' },
];

const oneDocumento = documentoArray[0];

const mockDocumentosService = {
  create: jest.fn(dto => ({ id: 3, ...dto })),
  findAll: jest.fn(() => documentoArray),
  findOne: jest.fn(id => documentoArray.find(d => d.id === id)),
  update: jest.fn((id, dto) => ({ ...oneDocumento, ...dto })),
  remove: jest.fn(id => undefined),
};

const mockPostulacionesService = {
  findOne: jest.fn(id => ({ id, postulante_id: 1, convocatoria_id: 1, programa_id: 1, fecha_postulacion: new Date(), estado: 'activa', disponibilidad_horaria: 'mañana' })),
};

describe('DocumentosController', () => {
  let controller: DocumentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [
        { provide: DocumentosService, useValue: mockDocumentosService },
        { provide: PostulacionesService, useValue: mockPostulacionesService },
      ],
    }).compile();

    controller = module.get<DocumentosController>(DocumentosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a documento', async () => {
    const dto: CreateDocumentoDto = {
      postulacion_id: 1,
      nombre_documento: 'Nuevo.pdf',
      ruta_archivo: '/files/nuevo.pdf',
    };
    expect(await controller.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all documentos', async () => {
    expect(await controller.findAll()).toEqual(documentoArray);
  });

  it('should return one documento', async () => {
    expect(await controller.findOne(1)).toEqual(oneDocumento);
  });

  it('should update a documento', async () => {
    const dto: UpdateDocumentoDto = { nombre_documento: 'Editado.pdf' };
    const mockReq = { user: { userId: 1, roles: [{ nombre_rol: 'admin' }] } };
    expect(await controller.update(1, dto, mockReq)).toEqual({ ...oneDocumento, ...dto });
  });

  it('should remove a documento', async () => {
    const mockReq = { user: { userId: 1, roles: [{ nombre_rol: 'admin' }] } };
    expect(await controller.remove(1, mockReq)).toBeUndefined();
  });
});
