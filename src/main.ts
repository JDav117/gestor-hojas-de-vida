import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as express from 'express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Servir archivos estáticos
  app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

  // Swagger config
  const config = new DocumentBuilder()
    .setTitle('GHV API')
    .setDescription('API para gestión de hojas de vida')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors({
    origin: '*', // Cambia esto a la URL de tu frontend en producción
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
);

await app.listen(process.env.PORT ?? 3000);
const port = process.env.PORT ?? 3000;
console.log(`Aplicación corriendo en: http://localhost:${port}`);

}
bootstrap();
