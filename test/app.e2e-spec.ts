




























































import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let token: string;
  let userId: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/ (GET)', () => {
    return request(server)
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });


  it('/roles/init (POST) - crear roles base', async () => {
    const res = await request(server)
      .post('/roles/init')
      .expect(201);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/users (POST) - registro de usuario', async () => {
    // Usar rol admin creado en init
    const rolesRes = await request(server)
      .get('/roles')
      .expect(200);
    const adminRole = rolesRes.body.find((role: any) => role.nombre_rol === 'admin');
    expect(adminRole).toBeDefined();
    const rolId = adminRole.id;

    const res = await request(server)
      .post('/users')
      .send({
        nombre: 'Test',
        apellido: 'User',
        email: 'testuser@mail.com',
        password: 'TestPass1!',
        identificacion: '999999',
        roles: [rolId],
      })
      .expect(201);
    expect(res.body).toHaveProperty('id');
    userId = res.body.id;
  });

  it('/auth/login (POST) - login', async () => {
    const res = await request(server)
      .post('/auth/login')
      .send({
        email: 'testuser@mail.com',
        password: 'TestPass1!',
      })
      .expect(201);
    expect(res.body).toHaveProperty('access_token');
    token = res.body.access_token;
  });

  it('/users (GET) - acceso protegido', async () => {
    const res = await request(server)
      .get('/users')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('/users/:id (GET) - acceso protegido', async () => {
    const res = await request(server)
      .get(`/users/${userId}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    expect(res.body).toHaveProperty('id', userId);
  });
});
