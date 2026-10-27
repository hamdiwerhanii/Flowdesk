import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../decorators/role.decorator';
import { AccountManagementService } from './account-management.service';
import { ApproveAccountDto } from './dto/approve-account.dto';

@ApiTags('account-management')
@Roles(Role.ADMIN)
@Controller('organizations/:orgId/account-requests')
export class AccountManagementController {
  constructor(private readonly accountService: AccountManagementService) {}

  @Get()
  listPending(@Param('orgId') orgId: string) {
    return this.accountService.listPending(orgId);
  }

  @Patch(':membershipId/approve')
  approve(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
    @Body() dto: ApproveAccountDto,
  ) {
    return this.accountService.approve(orgId, membershipId, dto);
  }

  @Patch(':membershipId/reject')
  reject(
    @Param('orgId') orgId: string,
    @Param('membershipId') membershipId: string,
  ) {
    return this.accountService.reject(orgId, membershipId);
  }
}
