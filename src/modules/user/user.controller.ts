import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
  Query,
  Put,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  CreateUserSwagger,
  FindAllUsersSwagger,
  FindOneUserSwagger,
  UpdateUserSwagger,
  RemoveUserSwagger,
} from './decorators/user.swagger.decorator';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardingStep1Dto, OnboardingStep2Dto, OnboardingPlayerDto, OnboardingCoachDto, VerifyOnboardingOtpDto } from './dto/onboarding.dto';
import { UpdateUserProfileDto, UpdatePlayerProfileDto, UpdateCoachProfileDto } from './dto/update-profile.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';
import {
  SerializeResponse,
  SerializationGroups,
} from '../../common/decorators/serialize-response.decorator';
import { Action } from '../../common/casl/ability.factory';
import { User } from './user.entity';
import { PlayerProfile } from './player-profile.entity';
import { CoachProfile } from './coach-profile.entity';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

/**
 * User Controller
 * Handles HTTP requests for user-related operations
 */
@ApiTags('users')
@ApiBearerAuth('defaultBearerAuth')
@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Onboarding Step 1: Phone Number + Basic Information
   * Finds or creates a user by phone number, saves basic profile fields,
   * and sends an OTP to the provided number for verification.
   * POST /users/onboarding/step1  [PUBLIC — no JWT required]
   */
  @Post('onboarding/step1')
  @Public()
  @HttpCode(HttpStatus.OK)
  async onboardingStep1(@Body() dto: OnboardingStep1Dto) {
    return await this.userService.onboardingStep1(dto);
  }

  /**
   * Onboarding OTP Verification
   * Verifies the OTP sent during step 1. On success sets isVerified=true
   * and returns a JWT access token for use in subsequent onboarding steps.
   * POST /users/onboarding/verify-otp  [PUBLIC — no JWT required]
   */
  @Post('onboarding/verify-otp')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verifyOnboardingOtp(@Body() dto: VerifyOnboardingOtpDto) {
    return await this.userService.verifyOnboardingOtp(dto);
  }

  /**
   * Onboarding Step 2: Role Selection
   * Requires the JWT obtained from verify-otp.
   * POST /users/onboarding/step2  [PROTECTED]
   */
  @Post('onboarding/step2')
  @SerializeResponse('admin', 'user')
  async onboardingStep2(@CurrentUser() user: User, @Body() dto: OnboardingStep2Dto) {
    return await this.userService.onboardingStep2(user.id, dto);
  }

  /**
   * Onboarding Step 3: Player Details
   * Requires the JWT obtained from verify-otp.
   * POST /users/onboarding/step3/player  [PROTECTED]
   */
  @Post('onboarding/step3/player')
  @SerializeResponse('admin', 'user')
  async onboardingStep3Player(@CurrentUser() user: User, @Body() dto: OnboardingPlayerDto) {
    return await this.userService.onboardingStep3Player(user.id, dto);
  }

  /**
   * Onboarding Step 3: Coach Details
   * Requires the JWT obtained from verify-otp.
   * POST /users/onboarding/step3/coach  [PROTECTED]
   */
  @Post('onboarding/step3/coach')
  @SerializeResponse('admin', 'user')
  async onboardingStep3Coach(@CurrentUser() user: User, @Body() dto: OnboardingCoachDto) {
    return await this.userService.onboardingStep3Coach(user.id, dto);
  }

  /**
   * Update user profile (common details)
   * PATCH /users/profile
   */
  @Patch('profile')
  @CheckPermissions({ action: Action.UPDATE, subject: 'user_profile' })
  @SerializeResponse('admin', 'user')
  async updateProfile(@Request() req, @Body() dto: UpdateUserProfileDto) {
    return await this.userService.updateProfile(req.user.id, dto);
  }

  /**
   * Update player profile
   * PATCH /users/profile/player
   */
  @Patch('profile/player')
  @CheckPermissions({ action: Action.UPDATE, subject: PlayerProfile })
  @SerializeResponse('admin', 'user')
  async updatePlayerProfile(@Request() req, @Body() dto: UpdatePlayerProfileDto) {
    return await this.userService.updatePlayerProfile(req.user.id, dto);
  }

  /**
   * Update coach profile
   * PATCH /users/profile/coach
   */
  @Patch('profile/coach')
  @CheckPermissions({ action: Action.UPDATE, subject: CoachProfile })
  @SerializeResponse('admin', 'user')
  async updateCoachProfile(@Request() req, @Body() dto: UpdateCoachProfileDto) {
    return await this.userService.updateCoachProfile(req.user.id, dto);
  }

  /**
   * Create a new user
   * POST /users
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPermissions({ action: Action.CREATE, subject: User })
  @CreateUserSwagger()
  @SerializeResponse('admin')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  /**
   * Get all users
   * GET /users
   */
  @Get()
  @CheckPermissions({ action: Action.READ, subject: User })
  @FindAllUsersSwagger()
  @SerializeResponse('admin', 'user')
  async findAll(@Query('includeDeleted') includeDeleted?: boolean) {
    return await this.userService.findAll(includeDeleted);
  }

  /**
   * Get user by ID
   * GET /users/:id
   */
  @Get(':id')
  @CheckPermissions({ action: Action.READ, subject: User })
  @FindOneUserSwagger()
  @SerializeResponse('admin', 'user')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }

  /**
   * Update user by ID
   * PATCH /users/:id
   */
  @Patch(':id')
  @CheckPermissions({ action: Action.UPDATE, subject: User })
  @UpdateUserSwagger()
  @SerializeResponse('admin')
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return await this.userService.update(id, updateUserDto);
  }

  /**
   * Soft delete user by ID
   * DELETE /users/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPermissions({ action: Action.DELETE, subject: User })
  @RemoveUserSwagger()
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
  }

  /**
   * Restore soft-deleted user by ID
   * PUT /users/:id/restore
   */
  @Put(':id/restore')
  @HttpCode(HttpStatus.OK)
  @CheckPermissions({ action: Action.UPDATE, subject: User })
  async restore(@Param('id') id: string) {
    await this.userService.restore(id);
    return { message: 'User restored successfully' };
  }
}
