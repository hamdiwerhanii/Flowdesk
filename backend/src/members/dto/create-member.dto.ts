import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { Role } from '@prisma/client';

export class CreateMemberDto {
  @IsEmail()
  @Transform(({ value }) => String(value).trim().toLowerCase())
  email: string;

  @IsString()
  @Length(2, 80)
  name: string;

  @IsEnum(Role)
  role: Role;
}
