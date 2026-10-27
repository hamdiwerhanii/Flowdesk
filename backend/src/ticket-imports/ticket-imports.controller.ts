import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CurrentUser } from '../decorators/current-user.decorator';
import { Roles } from '../decorators/role.decorator';
import { MAX_IMPORT_FILE_BYTES } from './consts/import.consts';
import { TicketImportsService } from './ticket-imports.service';

@ApiTags('imports')
@Roles(Role.ADMIN)
@Controller('organizations/:orgId/imports')
export class TicketImportsController {
  constructor(private readonly importsService: TicketImportsService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: MAX_IMPORT_FILE_BYTES } }),
  )
  preview(
    @Param('orgId') orgId: string,
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file) throw new BadRequestException('A CSV file is required');
    if (!file.originalname.toLowerCase().endsWith('.csv')) {
      throw new BadRequestException('Only .csv files are supported');
    }
    return this.importsService.preview(orgId, user.sub, file);
  }

  @Get()
  list(@Param('orgId') orgId: string) {
    return this.importsService.list(orgId);
  }

  @Get(':batchId')
  findOne(
    @Param('orgId') orgId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.importsService.findOne(orgId, batchId);
  }

  @Post(':batchId/commit')
  commit(
    @Param('orgId') orgId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.importsService.commit(orgId, batchId);
  }

  @Post(':batchId/revert')
  revert(
    @Param('orgId') orgId: string,
    @Param('batchId', ParseUUIDPipe) batchId: string,
  ) {
    return this.importsService.revert(orgId, batchId);
  }
}
