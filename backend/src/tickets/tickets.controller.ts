import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { type Membership, Role } from '@prisma/client';
import { CurrentMembership } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/role.decorator';
import { CreateTicketDto } from './dto/create-ticket.dto';
import { ListTicketsQueryDto } from './dto/list-tickets-query.dto';
import { UpdateTicketDto } from './dto/update-ticket.dto';
import { TicketsService } from './tickets.service';

@ApiTags('tickets')
@Controller('organizations/:orgId/tickets')
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Get()
  list(
    @Param('orgId') orgId: string,
    @CurrentMembership() membership: Membership,
    @Query() query: ListTicketsQueryDto,
  ) {
    return this.ticketsService.list(orgId, membership, query);
  }

  @Post()
  create(
    @Param('orgId') orgId: string,
    @CurrentMembership() membership: Membership,
    @Body() dto: CreateTicketDto,
  ) {
    return this.ticketsService.create(orgId, membership, dto);
  }

  @Get(':ticketId')
  findOne(
    @Param('orgId') orgId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentMembership() membership: Membership,
  ) {
    return this.ticketsService.findOne(orgId, membership, ticketId);
  }

  @Patch(':ticketId')
  update(
    @Param('orgId') orgId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentMembership() membership: Membership,
    @Body() dto: UpdateTicketDto,
  ) {
    return this.ticketsService.update(orgId, membership, ticketId, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':ticketId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('orgId') orgId: string,
    @Param('ticketId', ParseUUIDPipe) ticketId: string,
    @CurrentMembership() membership: Membership,
  ) {
    return this.ticketsService.remove(orgId, membership, ticketId);
  }
}
