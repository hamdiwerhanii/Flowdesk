import { Module } from '@nestjs/common';
import { TicketCommentsController } from './ticket-comments.controller';
import { TicketCommentsService } from './ticket-comments.service';
import { TicketNotificationsService } from './ticket-notifications.service';
import { TicketsController } from './tickets.controller';
import { TicketsService } from './tickets.service';

@Module({
  controllers: [TicketsController, TicketCommentsController],
  providers: [
    TicketsService,
    TicketCommentsService,
    TicketNotificationsService,
  ],
  exports: [TicketsService],
})
export class TicketsModule {}
