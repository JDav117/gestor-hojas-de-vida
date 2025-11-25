
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
import { ConvocatoriasModule } from './convocatorias/convocatorias.module';
import { ProgramasAcademicosModule } from './programas-academicos/programas-academicos.module';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60, limit: 100 }]),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      autoLoadEntities: true,
      synchronize: process.env.DB_SYNC === 'true',
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
  ConvocatoriasModule,
  ProgramasAcademicosModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
