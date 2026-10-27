import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles, STAFF_ROLES } from '../decorators/role.decorator';
import { CreateMemberDto } from './dto/create-member.dto';
import { ListMembersQueryDto } from './dto/list-members-query.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { MembersService } from './members.service';

@ApiTags('members')
@Controller('organizations/:orgId/members')
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Roles(...STAFF_ROLES)
  @Get()
  list(@Param('orgId') orgId: string, @Query() query: ListMembersQueryDto) {
    return this.membersService.list(orgId, query);
  }

  @Roles(Role.ADMIN)
  @Post()
  create(@Param('orgId') orgId: string, @Body() dto: CreateMemberDto) {
    return this.membersService.create(orgId, dto);
  }

  @Roles(Role.ADMIN)
  @Patch(':membershipId')
  updateRole(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateMemberDto,
  ) {
    return this.membersService.updateRole(orgId, membershipId, user.sub, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':membershipId')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.membersService.remove(orgId, membershipId, user.sub);
  }
}
