import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import { IS_PUBLIC_ROUTE } from 'src/common/decorator/public';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.get<boolean>(IS_PUBLIC_ROUTE, context.getHandler());

    if (isPublic) {
      request['user'] = null;
      return true;
    }

    try {
      const token = request.headers.authorization?.split('Bearer ')[1];
      request['user'] = jwt.verify(token, this.config.get('ACCESS_TOKEN_SECRET')!);
      return true;
    } catch (e) {
      return false;
    }
  }
}
