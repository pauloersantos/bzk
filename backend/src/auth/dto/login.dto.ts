import { IsEmail, IsOptional, IsString, IsUUID, Length, MaxLength } from 'class-validator';

export class LoginDto {
  @IsEmail() @MaxLength(254) email!: string;
  @IsString() @Length(12,128) password!: string;
  @IsOptional() @IsUUID() organizationId?: string;
}
