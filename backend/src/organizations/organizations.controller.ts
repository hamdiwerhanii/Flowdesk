import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Roles } from '../decorators/role.decorator';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@Controller('organizations/:orgId')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get()
  findOne(@Param('orgId') orgId: string) {
    return this.organizationsService.findOne(orgId);
  }

  @Roles(Role.ADMIN)
  @Patch()
  update(@Param('orgId') orgId: string, @Body() dto: UpdateOrganizationDto) {
    return this.organizationsService.update(orgId, dto);
  }
}
