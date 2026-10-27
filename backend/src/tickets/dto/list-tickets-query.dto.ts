import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';
import { PaginationDto } from '../../shared/dto/pagination.dto';

export class ListTicketsQueryDto extends PaginationDto {
  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
