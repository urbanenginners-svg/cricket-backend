import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academy } from './academy.entity';
import { AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';
import { Permission } from '../permission/permission.entity';
import { User } from '../user/user.entity';
import { Role } from '../role/role.entity';
import { AbilityFactory } from '@/common/casl/ability.factory';

@Module({
  imports: [
    TypeOrmModule.forFeature([Academy, User, Role, Permission]),
  ],
  controllers: [AcademyController],
  providers: [AcademyService, AbilityFactory],
  exports: [AcademyService],
})
export class AcademyModule {}
