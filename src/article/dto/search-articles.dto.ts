import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min, MinLength } from 'class-validator';

export enum SerachType {
  ALL = 'all',
  TITLE = 'title',
  AUTHOR = 'author',
}

export class SearchArticlesQueryDto {
  @IsEnum(SerachType)
  @IsOptional()
  type: SerachType = SerachType.ALL;

  @MinLength(4)
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  keyword: string;

  @IsInt()
  @Min(1)
  @Transform(({ value }) => +value)
  @IsOptional()
  page: number = 1;
}
