import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends PartialType(CreateServiceDto) {
  @IsOptional() @IsEnum(['active', 'inactive']) status?: 'active' | 'inactive';
  @IsInt() @Min(1) version!: number;
}
