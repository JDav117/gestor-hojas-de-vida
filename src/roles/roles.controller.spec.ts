import { Test, TestingModule } from '@nestjs/testing';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

describe('RolesController', () => {
  let controller: RolesController;
  let service: RolesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RolesController],
      providers: [
        {
          provide: RolesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            createInitialRoles: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<RolesController>(RolesController);
    service = module.get<RolesService>(RolesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call service.create on create', () => {
    const dto: CreateRoleDto = { nombre_rol: 'Test' };
    controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll on findAll', () => {
    controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should call service.findOne on findOne', async () => {
    await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('should call service.update on update', () => {
    const dto: UpdateRoleDto = { nombre_rol: 'Updated' };
    controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('should call service.remove on remove', () => {
    controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
  });

});
