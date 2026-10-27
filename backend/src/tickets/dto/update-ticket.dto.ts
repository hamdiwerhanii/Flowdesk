import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';

/** Customers may only send `status` (CLOSED or OPEN); the rest is staff-only. */
export class UpdateTicketDto {
  @IsOptional()
  @IsString()
  @Length(3, 200)
  subject?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10_000)
  description?: string;

  @IsOptional()
  @IsEnum(TicketStatus)
  status?: TicketStatus;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  /** `null` unassigns the ticket; omit it to leave the assignee unchanged. */
  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}
