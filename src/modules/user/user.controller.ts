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
import { OnboardingStep1Dto, OnboardingStep2Dto, OnboardingPlayerDto, OnboardingCoachDto } from './dto/onboarding.dto';
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
   * Onboarding Step 1: Basic Information
   * POST /users/onboarding/step1
   */
  @Post('onboarding/step1')
  @SerializeResponse('admin', 'user')
  async onboardingStep1(@Request() req, @Body() dto: OnboardingStep1Dto) {
    // Assuming user ID is in req.user.id from AuthGuard
    return await this.userService.onboardingStep1(req.user.id, dto);
  }

  /**
   * Onboarding Step 2: Role Selection
   * POST /users/onboarding/step2
   */
  @Post('onboarding/step2')
  @SerializeResponse('admin', 'user')
  async onboardingStep2(@Request() req, @Body() dto: OnboardingStep2Dto) {
    return await this.userService.onboardingStep2(req.user.id, dto);
  }

  /**
   * Onboarding Step 3: Player Details
   * POST /users/onboarding/step3/player
   */
  @Post('onboarding/step3/player')
  @SerializeResponse('admin', 'user')
  async onboardingStep3Player(@Request() req, @Body() dto: OnboardingPlayerDto) {
    return await this.userService.onboardingStep3Player(req.user.id, dto);
  }

  /**
   * Onboarding Step 3: Coach Details
   * POST /users/onboarding/step3/coach
   */
  @Post('onboarding/step3/coach')
  @SerializeResponse('admin', 'user')
  async onboardingStep3Coach(@Request() req, @Body() dto: OnboardingCoachDto) {
    return await this.userService.onboardingStep3Coach(req.user.id, dto);
  }

  /**
   * Update user profile (common details)
   * PATCH /users/profile
   */
  @Patch('profile')
  @SerializeResponse('admin', 'user')
  async updateProfile(@Request() req, @Body() dto: UpdateUserProfileDto) {
    return await this.userService.updateProfile(req.user.id, dto);
  }

  /**
   * Update player profile
   * PATCH /users/profile/player
   */
  @Patch('profile/player')
  @SerializeResponse('admin', 'user')
  async updatePlayerProfile(@Request() req, @Body() dto: UpdatePlayerProfileDto) {
    return await this.userService.updatePlayerProfile(req.user.id, dto);
  }

  /**
   * Update coach profile
   * PATCH /users/profile/coach
   */
  @Patch('profile/coach')
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
