import { Test, TestingModule } from '@nestjs/testing';
import { DocumentosController } from './documentos.controller';
import { DocumentosService } from './documentos.service';
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

describe('DocumentosController', () => {
  let controller: DocumentosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentosController],
      providers: [
        { provide: DocumentosService, useValue: mockDocumentosService },
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
    expect(await controller.update(1, dto)).toEqual({ ...oneDocumento, ...dto });
  });

  it('should remove a documento', async () => {
    expect(await controller.remove(1)).toBeUndefined();
  });
});
