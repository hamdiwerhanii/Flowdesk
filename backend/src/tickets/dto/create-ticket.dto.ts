import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator';
import { TicketPriority } from '@prisma/client';

export class CreateTicketDto {
  @IsString()
  @Length(3, 200)
  subject: string;

  @IsString()
  @Length(1, 10_000)
  description: string;

  @IsOptional()
  @IsEnum(TicketPriority)
  priority?: TicketPriority;

  @IsOptional()
  @IsUUID()
  requesterId?: string;

  @IsOptional()
  @IsUUID()
  assigneeId?: string;
}
