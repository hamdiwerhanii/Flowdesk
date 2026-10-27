import { IsEnum } from 'class-validator';
import { Role } from '@prisma/client';

export class UpdateMemberDto {
  @IsEnum(Role)
  role: Role;
}
