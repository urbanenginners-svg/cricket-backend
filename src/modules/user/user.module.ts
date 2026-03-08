import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { User } from './user.entity';
import { PlayerProfile } from './player-profile.entity';
import { CoachProfile } from './coach-profile.entity';
import { Role } from '../role/role.entity';
import { Permission } from '../permission/permission.entity';
import { AbilityFactory } from '../../common/casl/ability.factory';

/**
 * User Module
 * Encapsulates all user-related functionality
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, Permission, PlayerProfile, CoachProfile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AbilityFactory],
  exports: [UserService, AbilityFactory],
})
export class UserModule { }
