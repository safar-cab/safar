import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  @IsOptional()
  isbn?: string;

  @IsInt()
  @Min(1000)
  @Max(2100)
  publishedYear: number;

  @IsString()
  @IsOptional()
  genre?: string;
}
