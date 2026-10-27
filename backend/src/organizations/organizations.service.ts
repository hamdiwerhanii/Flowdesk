import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

const organizationSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
} as const;

@Injectable()
export class OrganizationsService {
  constructor(private readonly prisma: PrismaService) {}

  findOne(orgId: string) {
    return this.prisma.organization.findUniqueOrThrow({
      where: { id: orgId },
      select: organizationSelect,
    });
  }

  update(orgId: string, dto: UpdateOrganizationDto) {
    return this.prisma.organization.update({
      where: { id: orgId },
      data: { name: dto.name },
      select: organizationSelect,
    });
  }
}
