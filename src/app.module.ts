
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { AuthModule } from './auth/auth.module';
import { DocumentosModule } from './documentos/documentos.module';
import { PostulacionesModule } from './postulaciones/postulaciones.module';
import { ItemsEvaluacionModule } from './items-evaluacion/items-evaluacion.module';
import { EvaluacionesModule } from './evaluaciones/evaluaciones.module';
import { BaremoConvocatoriaModule } from './baremo-convocatoria/baremo-convocatoria.module';
import { CommonModule } from './common/common.module';
import { AsignacionesModule } from './asignaciones/asignaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10), // Default to 3306 if undefined
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: true, // Solo para desarrollo
    }),
  UsersModule,
  RolesModule,
  AuthModule,
  DocumentosModule,
  PostulacionesModule,
  ItemsEvaluacionModule,
  EvaluacionesModule,
  BaremoConvocatoriaModule,
  CommonModule,
  AsignacionesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
