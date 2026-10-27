import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { TicketPriority, TicketStatus } from '@prisma/client';

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

  @IsOptional()
  @IsUUID()
  assigneeId?: string | null;
}
