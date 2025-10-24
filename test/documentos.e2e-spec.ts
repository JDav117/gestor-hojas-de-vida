import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';

describe('Documentos (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let token: string;
  let documentoId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();

    // Crear usuario y obtener token
    await request(server).post('/roles/init');
    await request(server)
      .post('/users')
      .send({
        nombre: 'Test',
        apellido: 'Doc',
        email: 'testdoc@mail.com',
        password: '123456',
        identificacion: '888888',
        roles: [1],
      });
    const res = await request(server)
      .post('/auth/login')
      .send({ email: 'testdoc@mail.com', password: '123456' });
    token = res.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/documentos (POST) - crear documento', async () => {
    const res = await request(server)
      .post('/documentos')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postulacion_id: 1,
        nombre_documento: 'CV.pdf',
        ruta_archivo: '/files/cv.pdf',
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    documentoId = res.body.id;
  });

  it('/documentos (GET) - listar documentos', async () => {
    const res = await request(server)
      .get('/documentos')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/documentos/:id (GET) - obtener documento', async () => {
    const res = await request(server)
      .get(`/documentos/${documentoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', documentoId);
  });

  it('/documentos/:id (PATCH) - actualizar documento', async () => {
    const res = await request(server)
      .patch(`/documentos/${documentoId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre_documento: 'CV_actualizado.pdf' })
      .expect(403); // Expecting Forbidden because user is not admin
  });

  it('/documentos/:id (DELETE) - eliminar documento', async () => {
    await request(server)
      .delete(`/documentos/${documentoId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(403); // Expecting Forbidden because user is not admin
  });
});
