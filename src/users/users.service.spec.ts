import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Usuario } from './user.entity';
import { Role } from '../roles/role.entity';
import { Repository } from 'typeorm';

describe('UsersService', () => {
  let service: UsersService;
  let usersRepository: Repository<Usuario>;
  let rolesRepository: Repository<Role>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(Usuario),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Role),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    usersRepository = module.get<Repository<Usuario>>(getRepositoryToken(Usuario));
    rolesRepository = module.get<Repository<Role>>(getRepositoryToken(Role));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // Puedes agregar más pruebas unitarias aquí para create, findAll, findOne, update, remove
});
