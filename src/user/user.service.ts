import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/database/model/user.entity';
import { CreateUserDto } from 'src/user/dto/create-user';
import type { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async createUser(dto: CreateUserDto) {
    const alreadyExists = await this.userRepository.exists({ where: { email: dto.email } });
    if (alreadyExists) return { message: '이미 사용중인 Email 입니다.' };

    await this.userRepository
      .save(await UserEntity.from(dto))
      .then((userEntity) => userEntity)
      .catch((e) => {
        return { message: '사용자 등록에 실패했습니다.' };
      });

    return { message: `사용자 등록에 성공했습니다.` };
  }
}
