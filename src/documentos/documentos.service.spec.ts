import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DocumentosService } from './documentos.service';
import { Documento } from './documento.entity';

const documentoArray = [
  { id: 1, postulacion_id: 1, nombre_documento: 'CV.pdf', ruta_archivo: '/files/cv.pdf' },
  { id: 2, postulacion_id: 2, nombre_documento: 'Certificado.pdf', ruta_archivo: '/files/certificado.pdf' },
];

const mockDocumentoRepo = {
  create: jest.fn(dto => dto),
  save: jest.fn(dto => ({ id: 3, ...dto })),
  find: jest.fn(() => documentoArray),
  findOneBy: jest.fn(({ id }) => documentoArray.find(d => d.id === id)),
  update: jest.fn((id, dto) => {
    const idx = documentoArray.findIndex(x => x.id === id);
    if (idx !== -1) {
      documentoArray[idx] = { ...documentoArray[idx], ...dto };
      return documentoArray[idx];
    }
    return undefined;
  }),
  delete: jest.fn(id => undefined),
};

describe('DocumentosService', () => {
  let service: DocumentosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentosService,
        { provide: getRepositoryToken(Documento), useValue: mockDocumentoRepo },
      ],
    }).compile();

    service = module.get<DocumentosService>(DocumentosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a documento', async () => {
    const dto = { postulacion_id: 1, nombre_documento: 'Nuevo.pdf', ruta_archivo: '/files/nuevo.pdf' };
    expect(await service.create(dto)).toEqual({ id: 3, ...dto });
  });

  it('should return all documentos', async () => {
    expect(await service.findAll()).toEqual(documentoArray);
  });

  it('should return one documento', async () => {
    expect(await service.findOne(1)).toEqual(documentoArray[0]);
  });

  it('should update a documento', async () => {
    const dto = { nombre_documento: 'Editado.pdf' };
    expect(await service.update(1, dto)).toEqual({ ...documentoArray[0], ...dto });
  });

  it('should remove a documento', async () => {
    expect(await service.remove(1)).toBeUndefined();
  });
});
