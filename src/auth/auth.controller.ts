import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  LoginSwagger,
  GetProfileSwagger,
  GetSuperAdminSwagger,
} from './decorators/auth.swagger.decorator';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { MobileLoginDto, VerifyOtpDto, SocialLoginDto } from './dto/auth-actions.dto';
import { AuthGuard } from '../common/guards/auth.guard';
import { User } from '../modules/user/user.entity';

/**
 * Auth Controller
 * Handles authentication and authorization endpoints
 */
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) { }

  /**
   * User login
   * POST /auth/login
   */
  @Post('login')
  @LoginSwagger()
  async login(@Body() loginDto: LoginDto) {
    return await this.authService.login(loginDto);
  }

  /**
   * Mobile Login (Send OTP)
   * POST /auth/login-mobile
   */
  @Post('login-mobile')
  @ApiTags('auth')
  async loginMobile(@Body() mobileLoginDto: MobileLoginDto) {
    return await this.authService.sendOtp(mobileLoginDto);
  }

  /**
   * Verify OTP and Login
   * POST /auth/verify-mobile
   */
  @Post('verify-mobile')
  @ApiTags('auth')
  async verifyMobile(@Body() verifyOtpDto: VerifyOtpDto) {
    return await this.authService.verifyOtp(verifyOtpDto);
  }

  /**
   * Social Login Stub (Google/Facebook)
   * POST /auth/login-social
   */
  @Post('login-social')
  @ApiTags('auth')
  async loginSocial(@Body() socialLoginDto: SocialLoginDto) {
    return await this.authService.socialLoginStub(socialLoginDto);
  }

  /**
   * Get current user profile
   * GET /auth/profile
   */
  @Get('profile')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('defaultBearerAuth')
  @GetProfileSwagger()
  async getProfile(@Request() req) {
    // User is already attached to request by JWT strategy
    const { password, ...userProfile } = req.user;
    return userProfile;
  }

  /**
   * Get superadmin user for testing (temporary endpoint)
   * GET /auth/superadmin
   */
  @Get('superadmin')
  @GetSuperAdminSwagger()
  async getSuperAdmin() {
    const superAdmin = await this.userRepository.findOne({
      where: { email: 'superadmin@example.com' },
      relations: ['roles', 'roles.permissions'],
      select: ['id', 'name', 'email', 'isActive', 'createdAt'],
    });

    return {
      user: superAdmin,
      instructions: {
        message: 'Use the login endpoint to get JWT token',
        credentials: {
          email: 'superadmin@example.com',
          password: 'SuperAdmin123!',
        },
        usage: {
          step1: 'POST /auth/login with above credentials',
          step2: 'Copy the access_token from response',
          step3: 'Add Authorization header: Bearer {access_token}',
        },
      },
    };
  }
}
