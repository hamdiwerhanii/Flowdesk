import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class ApproveAccountDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
