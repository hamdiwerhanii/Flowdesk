import { Module } from '@nestjs/common';
import { TicketImportsController } from './ticket-imports.controller';
import { TicketImportsService } from './ticket-imports.service';

@Module({
  controllers: [TicketImportsController],
  providers: [TicketImportsService],
})
export class TicketImportsModule {}
