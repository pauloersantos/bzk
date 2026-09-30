import { OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(OmitType(CreateProjectDto, ['status'] as const)) {
  @IsOptional() @IsEnum(['planning', 'active', 'suspended', 'completed', 'cancelled']) status?: 'planning' | 'active' | 'suspended' | 'completed' | 'cancelled';
  @IsInt() @Min(1) version!: number;
}
