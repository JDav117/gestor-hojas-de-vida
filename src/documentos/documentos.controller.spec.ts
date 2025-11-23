import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { PostulacionesService } from '../postulaciones/postulaciones.service';
import { AsignacionesService } from '../asignaciones/asignaciones.service';

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

// Mock para PostulacionesService porque el controller lo usa
const mockPostulacionesService = {
  findOne: jest.fn(id => ({
    id,
    postulante: { id: 99 }, // Simula dueño de la postulación
  })),
  findAllForPostulante: jest.fn(() => []),
};

// Mock para AsignacionesService
const mockAsignacionesService = {
  getPostulacionIdsForEvaluador: jest.fn(() => []),
  isAssigned: jest.fn(() => true),
};

describe('DocumentosController', () => {
  let controller: DocumentosController;

  const mockReq = {
    user: {
      userId: 99,
      roles: ['admin'], // Para evitar ForbiddenException
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [
        { provide: DocumentosService, useValue: mockDocumentosService },
        { provide: PostulacionesService, useValue: mockPostulacionesService },
        { provide: AsignacionesService, useValue: mockAsignacionesService },
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

    expect(await controller.create(dto, mockReq)).toEqual({ id: 3, ...dto });
  });

  it('should return all documentos', async () => {
    expect(await controller.findAll(mockReq)).toEqual(documentoArray);
  });

  it('should return one documento', async () => {
    expect(await controller.findOne(1, mockReq)).toEqual(oneDocumento);
  });

  it('should update a documento', async () => {
    const dto: UpdateDocumentoDto = { nombre_documento: 'Editado.pdf' };

    expect(await controller.update(1, dto, mockReq)).toEqual({
      ...oneDocumento,
      ...dto,
    });
  });

  it('should remove a documento', async () => {
    expect(await controller.remove(1, mockReq)).toBeUndefined();
  });
});

