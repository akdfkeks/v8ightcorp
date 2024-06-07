import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { CreateAccessTokenDto } from 'src/auth/dto/create-access';
import { RefreshAccessTokenDto } from 'src/auth/dto/refresh-access';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public async login(@Body() payload: CreateAccessTokenDto) {
    return this.authService.login(payload);
  }

  @Post('refresh')
  public async refreshAccess(@Body() payload: RefreshAccessTokenDto) {
    return this.authService.refresh(payload);
  }
}
