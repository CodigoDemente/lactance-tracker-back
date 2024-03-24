import { Module } from '@nestjs/common';
import { ChildService } from './child.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Child } from './child.entity';
import { UserModule } from '../user/user.module';
import { ChildController } from './child.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Child]), UserModule],
  providers: [ChildService],
  controllers: [ChildController],
  exports: [ChildService],
})
export class ChildModule {}
