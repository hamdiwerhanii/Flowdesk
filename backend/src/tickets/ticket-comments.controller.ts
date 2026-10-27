import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Membership } from '@prisma/client';
import { CurrentMembership } from '../decorators/current-user.decorator';
import { CreateCommentDto } from './dto/create-comment.dto';
import { TicketCommentsService } from './ticket-comments.service';

@ApiTags('tickets')
@Controller('organizations/:orgId/tickets/:ticketId/comments')
export class TicketCommentsController {
  constructor(private readonly commentsService: TicketCommentsService) {}

  @Get()
  list(
    @Param('orgId') orgId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentMembership() membership: Membership,
  ) {
    return this.commentsService.list(orgId, membership, ticketId);
  }

  @Post()
  create(
    @Param('orgId') orgId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentMembership() membership: Membership,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.create(orgId, membership, ticketId, dto);
  }
}
