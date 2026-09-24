import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CreateStageDto } from './create-stage.dto';

export class UpdateStageDto extends PartialType(CreateStageDto) {
  @IsOptional() @IsEnum(['active', 'inactive']) status?: 'active' | 'inactive';
  @IsInt() @Min(1) version!: number;
}
