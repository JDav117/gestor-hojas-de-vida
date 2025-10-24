import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './jwt.strategy';
import { JwtAuthGuard } from './jwt-auth.guard';
import { RolesModule } from '../roles/roles.module';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
		imports: [
			UsersModule,
			RolesModule,
      ThrottlerModule.forRoot([{ ttl: 60, limit: 10 }]),
			JwtModule.registerAsync({
				imports: [ConfigModule],
				useFactory: async (configService: ConfigService) => ({
					secret: configService.get<string>('JWT_SECRET'),
					signOptions: { expiresIn: '1d' },
				}),
				inject: [ConfigService],
			}),
		],
	controllers: [AuthController],
			providers: [AuthService, JwtStrategy, JwtAuthGuard],
		exports: [AuthService, JwtAuthGuard],
})
export class AuthModule {}
