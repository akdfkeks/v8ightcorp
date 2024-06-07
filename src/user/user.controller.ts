import { Body, Controller, Post } from '@nestjs/common';
import { PublicRoute } from 'src/common/decorator/public';
import { CreateUserDto } from 'src/user/dto/create-user';
import { UserService } from 'src/user/user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @PublicRoute()
  @Post()
  public async signup(@Body() payload: CreateUserDto) {
    return this.userService.createUser(payload);
  }
}
