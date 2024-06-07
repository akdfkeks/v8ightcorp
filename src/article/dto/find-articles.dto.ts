import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsInt, Min, Max } from 'class-validator';

export enum Period {
  All = 'all',
  Year = 'year',
  Month = 'month',
  Week = 'week',
}

export enum SortOrder {
  Latest = 'latest',
  Best = 'best',
}

export class FindArticlesQueryDto {
  @IsEnum(SortOrder)
  @IsOptional()
  sort: SortOrder = SortOrder.Latest;

  @IsEnum(Period)
  @IsOptional()
  period: Period = Period.Week;

  @IsInt()
  @Min(0)
  @Transform(({ value }) => +value)
  @IsOptional()
  page: number = 0;
}
