import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { Role } from '@prisma/client';
import { PaginationDto } from '../../shared/dto/pagination.dto';

export class ListMembersQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
