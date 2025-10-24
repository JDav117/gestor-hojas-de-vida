import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on create', async () => {
    const dto: CreateUserDto = {
      nombre: 'Test',
      apellido: 'User',
      email: 'test@mail.com',
      password: 'Abc12345!',
      identificacion: '123',
    } as any;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll on findAll', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne on findOne', async () => {
    await controller.findOne(1);
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should call service.update on update', () => {
    const dto: UpdateUserDto = { nombre: 'Updated' } as any;
    controller.update(1, dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should call service.remove on remove', () => {
    controller.remove(1);
    expect(service.remove).toHaveBeenCalledWith(1);
  });
});
