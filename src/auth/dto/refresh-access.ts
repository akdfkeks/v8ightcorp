import { IsJWT, IsNotEmpty, IsString } from 'class-validator';

export class RefreshAccessTokenDto {
  @IsJWT()
  @IsString()
  @IsNotEmpty()
  refresh: string;
}
