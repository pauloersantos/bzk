import { PartialType } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CreateSupplierDto } from './create-supplier.dto';

export class UpdateSupplierDto extends PartialType(CreateSupplierDto) {
  @IsOptional() @IsEnum(['active', 'under_review', 'inactive']) status?: 'active' | 'under_review' | 'inactive';
  @IsInt() @Min(1) version!: number;
}
