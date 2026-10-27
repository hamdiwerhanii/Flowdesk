import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsString, Length } from 'class-validator';
import { Role } from '@prisma/client';

/**
 * Adds a member. A new email gets an invitation link to choose their own
 * password; admins never set or see other people's passwords.
 */
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
