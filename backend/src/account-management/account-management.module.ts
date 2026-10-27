import { Module } from '@nestjs/common';
import { AccountManagementController } from './account-management.controller';
import { AccountManagementService } from './account-management.service';

@Module({
  controllers: [AccountManagementController],
  providers: [AccountManagementService],
})
export class AccountManagementModule {}
