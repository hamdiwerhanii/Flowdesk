import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles, STAFF_ROLES } from '../decorators/role.decorator';
import { DashboardService } from './dashboard.service';

@ApiTags('dashboard')
@Roles(...STAFF_ROLES)
@Controller('organizations/:orgId/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getStats(@Param('orgId') orgId: string, @CurrentUser() user: JwtPayload) {
    return this.dashboardService.getStats(orgId, user.sub);
  }
}
