import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsNumberString, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({ example: 'Residência Horizonte' }) @IsString() @Length(3, 160) name!: string;
  @ApiProperty({ example: 'Rua das Acácias, 120, São Paulo/SP' }) @IsString() @Length(5, 300) address!: string;
  @ApiPropertyOptional({ example: 'Condomínio Fazenda Boa Vista' }) @IsOptional() @IsString() @Length(2, 160) condominium?: string;
  @ApiProperty({ example: '680.0000', description: 'Decimal enviado como string' }) @IsNumberString() builtAreaM2!: string;
  @ApiProperty({ example: '4850000.00', description: 'BRL enviado como string' }) @IsNumberString() approvedBudget!: string;
  @ApiProperty({ example: '2026-08-05' }) @IsDateString() plannedStart!: string;
  @ApiProperty({ example: '2027-12-18' }) @IsDateString() plannedEnd!: string;
  @ApiProperty({ enum: ['planning', 'active'], example: 'planning' }) @IsEnum(['planning', 'active']) status!: 'planning' | 'active';
  @ApiPropertyOptional({ example: '00000000-0000-4000-8000-000000000010' }) @IsOptional() @IsUUID() technicalResponsibleId?: string;
}
