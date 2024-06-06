import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity, UserRole } from 'src/database/model/user.entity';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';

class MockRepository {
  private db: Array<any> = [];
  async save(param: any) {
    this.db.push(param);
    return new UserEntity();
  }

  async exists(q: { where: { email: string } }) {
    return this.db.find((e) => e.email == q.where.email);
  }
}

describe('UserService', () => {
  let app: INestApplication;
  let userService: UserService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MockRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    userService = app.get<UserService>(UserService);
    app.init();
  });

  it('should return success message.', async () => {
    const rst = await userService.createUser({
      email: 'alice@example.com',
      name: 'alice',
      password: '1234',
      role: UserRole.NORMAL,
    });
    expect(rst.message).toBe('사용자 등록에 성공했습니다.');
  });

  it('should return failure message.', async () => {
    const rst = await userService.createUser({
      email: 'alice@example.com',
      name: 'alice',
      password: '1234',
      role: UserRole.NORMAL,
    });
    expect(rst.message).toBe('이미 사용중인 Email 입니다.');
  });
});
