import { INestApplication, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
import { ConfigModule } from 'src/config/config.module';
import { UserEntity, UserRole } from 'src/database/model/user.entity';
import { Repository } from 'typeorm';

class MockRepository {
  private db: Array<UserEntity> = [];
  async save(param: UserEntity) {
    param.id = 1;
    this.db.push(param);
    return this.db.at(-1);
  }

  async findOneBy(where: { email: string }) {
    return this.db.find((e) => e.email == where.email);
  }
}

describe('AuthService', () => {
  let app: INestApplication;
  let authService: AuthService;
  let userRepository: Repository<UserEntity>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule],
      controllers: [AuthController],
      providers: [
        ConfigService,
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: MockRepository,
        },
      ],
    }).compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    app.init();

    authService = app.get<AuthService>(AuthService);
    userRepository = app.get(getRepositoryToken(UserEntity));

    await userRepository.save(
      await UserEntity.from({
        email: 'alice@example.com',
        name: 'alice',
        password: '1234',
        role: UserRole.ADMIN,
      }),
    );
  });

  it('should return tokens.', async () => {
    const rst = await authService.login({
      email: 'alice@example.com',
      password: '1234',
    });
    expect(rst.token).toBeDefined();
  });

  it('should throw error.', async () => {
    const fn = async () =>
      await authService.login({
        email: 'bob@example.com',
        password: '1234',
      });

    expect(fn).rejects.toThrow(UnauthorizedException);
  });

  it('should return access token.', async () => {
    const {
      token: { refresh },
    } = await authService.login({
      email: 'alice@example.com',
      password: '1234',
    });

    const fn = await authService.refresh({ refresh });
    expect(fn.accessToken).toBeDefined();
  });

  it('should throw error.', async () => {
    const fn = async () => await authService.refresh({ refresh: '123' });
    expect(fn).rejects.toThrow(UnauthorizedException);
  });
});
