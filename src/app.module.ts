import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './config/env.validation';
import { getDatabaseConfig } from './config/database.config';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { FileModule } from './modules/file/file.module';
import { AuthModule } from './auth/auth.module';
import { AcademyModule } from './modules/academy/academy.module';
import { SeedService } from './database/seed.service';
import { User } from './modules/user/user.entity';
import { Role } from './modules/role/role.entity';
import { Permission } from './modules/permission/permission.entity';
import { File } from './modules/file/file.entity';
import { SerializationInterceptor } from './common/interceptors/serialization.interceptor';

/**
 * Root Application Module
 * Imports all feature modules and configures global settings
 */
@Module({
  imports: [
    // Configuration Module - must be first
    ConfigModule.forRoot({
      isGlobal: true, // Make ConfigService available everywhere
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`, // Load environment-specific .env file
      validate, // Validate environment variables on startup
      cache: true, // Cache environment variables for performance
    }),

    // TypeORM Database Module - async configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: getDatabaseConfig,
    }),

    // TypeORM entities for SeedService
    TypeOrmModule.forFeature([
      User,
      Role,
      Permission,
      File,
    ]),

    // Feature Modules
    UserModule,
    RoleModule,
    PermissionModule,
    FileModule,
    AuthModule,
    AcademyModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_INTERCEPTOR,
      useClass: SerializationInterceptor,
    },
  ],
})
export class AppModule { }
