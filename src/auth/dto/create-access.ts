import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateAccessTokenDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(100)
  @MinLength(4)
  @IsString()
  @IsNotEmpty()
  password: string;
}
