import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { UserRole } from 'src/database/model/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(100)
  @MinLength(4)
  @IsString()
  @IsNotEmpty()
  password: string;

  @MaxLength(100)
  @MinLength(3)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;
}
