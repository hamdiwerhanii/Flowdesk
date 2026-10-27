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

  /** `me`, `unassigned`, or a user id. Ignored for customers. */
  @IsOptional()
  @IsString()
  assignee?: string;

  /** Matches the subject, or the ticket number (`42` or `#42`). */
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}
