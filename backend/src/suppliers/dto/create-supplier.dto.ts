import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class CreateSupplierDto {
  @ApiProperty({ enum: ['company', 'individual'], example: 'company' }) @IsEnum(['company','individual']) personType!: 'company'|'individual';
  @ApiProperty({ example: 'Alfa Estruturas Ltda.' }) @IsString() @Length(3,180) legalName!: string;
  @ApiPropertyOptional({ example: 'Alfa Estruturas' }) @IsOptional() @IsString() tradeName?: string;
  @ApiProperty({ example: '12345678000190' }) @IsString() @Length(11,14) taxId!: string;
  @ApiProperty({ example: 'Estrutura' }) @IsString() @Length(2,100) primarySpecialty!: string;
  @ApiProperty({ example: 'contato@alfa.com.br' }) @IsEmail() email!: string;
  @ApiProperty({ example: '+5511999999999' }) @IsString() @Length(8,24) phone!: string;
  @ApiProperty({ example: 30 }) @IsInt() @Min(0) @Max(3650) averageLeadTimeDays!: number;
  @ApiPropertyOptional({ example: 'Fornecedor homologado para estruturas de concreto.' }) @IsOptional() @IsString() notes?: string;
}
