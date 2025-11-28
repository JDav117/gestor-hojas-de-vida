import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { Role } from '../roles/role.entity';
import { StorageService } from '../common/storage/storage.service';

@Module({
	imports: [TypeOrmModule.forFeature([User, Role])],
	controllers: [UsersController],
	providers: [UsersService, StorageService],
	exports: [UsersService],
})
export class UsersModule {}
