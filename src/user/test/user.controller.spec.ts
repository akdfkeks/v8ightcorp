import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';

describe('UserController', () => {
  let app: INestApplication;
  let userController: UserController;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            createUser: jest.fn().mockResolvedValue({ message: 'TestValue' }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userController = app.get<UserController>(UserController);

    app.init();
  });

  it('should return UserService', async () => {
    const res = await userController.signup({ email: 'alice@example.com', name: 'elice', password: '1234' });
    expect(res.message).toBe('TestValue');
  });
});
