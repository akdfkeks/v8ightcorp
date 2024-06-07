import { Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateAccessTokenDto } from 'src/auth/dto/create-access';
import { UserEntity } from 'src/database/model/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { RefreshAccessTokenDto } from 'src/auth/dto/refresh-access';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async login(payload: CreateAccessTokenDto) {
    const user = await this.userRepository.findOneBy({ email: payload.email });
    const isPwCorrect = user == null ? false : await bcrypt.compare(payload.password, user.password);

    if (!user || !isPwCorrect) throw new UnauthorizedException('이메일 또는 비밀번호를 확인해주세요.');
    return {
      token: {
        access: this.createAccessToken({ id: user.id, role: user.role }),
        refresh: this.createRefreshToken({ id: user.id, role: user.role }),
      },
    };
  }

  public async refresh(payload: RefreshAccessTokenDto) {
    let tokenPayload;
    try {
      tokenPayload = this.verifyJwt(payload.refresh, 'REFRESH');
    } catch (e) {
      if (e instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('다시 로그인해주세요.');
      } else throw new InternalServerErrorException('알 수 없는 오류가 발생했습니다. 다시 로그인해주세요.');
    }
    return { accessToken: this.createAccessToken(tokenPayload) };
  }

  private createAccessToken(payload: any) {
    return this.signJwt(payload, 'ACCESS');
  }

  private createRefreshToken(payload: any) {
    return this.signJwt(payload, 'REFRESH');
  }

  private signJwt(payload: any, type: 'ACCESS' | 'REFRESH') {
    const { exp, iat, ...user } = payload;
    return jwt.sign(user, this.config.get(`${type}_TOKEN_SECRET`)!, { expiresIn: type === 'ACCESS' ? '1d' : '30d' });
  }

  /**
   * it can throw error
   */
  private verifyJwt(token: string, type: 'ACCESS' | 'REFRESH') {
    return jwt.verify(token, this.config.get(`${type}_TOKEN_SECRET`)!);
  }
}
