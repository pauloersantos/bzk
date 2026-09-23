import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, IsUUID, Length, Min } from 'class-validator';

export class CreateStageDto {
  @ApiProperty({ example: 'EST-010' }) @IsString() @Length(2, 40) code!: string;
  @ApiProperty({ example: 'Fundações e estrutura' }) @IsString() @Length(3, 160) name!: string;
  @ApiPropertyOptional({ example: 'Terraplenagem, fundações e estrutura principal.' }) @IsOptional() @IsString() description?: string;
  @ApiPropertyOptional({ example: '00000000-0000-4000-8000-000000000020' }) @IsOptional() @IsUUID() parentStageId?: string;
  @ApiProperty({ example: 10 }) @IsInt() @Min(0) displayOrder!: number;
}
