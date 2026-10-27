import { IsEnum, IsOptional } from 'class-validator';
import { Role } from '@prisma/client';

export class ApproveAccountDto {
  /** Defaults to CUSTOMER, the role the user signed up for. */
  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
