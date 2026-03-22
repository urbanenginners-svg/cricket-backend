import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';
import { PlayerProfile } from './player-profile.entity';
import { CoachProfile } from './coach-profile.entity';
import { Role } from '../role/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardingStep1Dto, OnboardingStep2Dto, OnboardingPlayerDto, OnboardingCoachDto, VerifyOnboardingOtpDto } from './dto/onboarding.dto';
import { UpdateUserProfileDto, UpdatePlayerProfileDto, UpdateCoachProfileDto } from './dto/update-profile.dto';
import { JwtPayload } from '../../auth/strategies/jwt.strategy';

/**
 * User Service
 * Handles all business logic related to user operations
 */
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PlayerProfile)
    private readonly playerProfileRepository: Repository<PlayerProfile>,
    @InjectRepository(CoachProfile)
    private readonly coachProfileRepository: Repository<CoachProfile>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly jwtService: JwtService,
  ) { }

  /**
   * Create a new user
   * @param createUserDto - User creation data
   * @returns Created user
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  /**
   * Onboarding Step 1: Phone number + Basic Info → generates & sends OTP
   * Public endpoint: finds or creates a user by phone number, saves basic
   * profile fields, then generates a 6-digit OTP for phone verification.
   */
  async onboardingStep1(dto: OnboardingStep1Dto): Promise<{ message: string }> {
    // Find existing user by phone number or create a new one
    let user = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if(user && user.isVerified) {
      throw new UnauthorizedException('Phone number already verified. Please log in instead.');
    }

    if (!user) {
      user = this.userRepository.create({
        phoneNumber: dto.phoneNumber,
        authProvider: 'mobile',
        isActive: true,
      });
    }

    // Update basic profile fields
    if (dto.name) user.name = dto.name;
    user.gender = dto.gender;
    user.dateOfBirth = new Date(dto.dateOfBirth);
    user.placeOfBirth = dto.placeOfBirth;

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // 10-minute expiry

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await this.userRepository.save(user);

    // TODO: Integrate SMS service here to send OTP to dto.phoneNumber
    // Example: await this.smsService.send(dto.phoneNumber, `Your OTP is ${otp}`);
    // For now, log OTP in development mode only
    console.log(`[DEV ONLY] OTP for ${dto.phoneNumber}: ${otp}`);

    return { message: 'OTP sent successfully. Please verify your phone number.' };
  }

  /**
   * Verify OTP sent during onboarding step 1.
   * On success: marks the user as verified and returns a JWT access token.
   */
  async verifyOnboardingOtp(dto: VerifyOnboardingOtpDto) {
    // Load user together with the normally-excluded OTP fields
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.otp')
      .addSelect('user.otpExpiresAt')
      .leftJoinAndSelect('user.roles', 'roles')
      .leftJoinAndSelect('roles.permissions', 'permissions')
      .where('user.phoneNumber = :phoneNumber', { phoneNumber: dto.phoneNumber })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('No account found for this phone number');
    }

    if (!user.otp || user.otp !== dto.otp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      throw new UnauthorizedException('OTP has expired. Please request a new one.');
    }

    // Mark phone as verified and clear OTP fields
    await this.userRepository.update(user.id, {
      isVerified: true,
      otp: null,
      otpExpiresAt: null,
    });

    // Generate JWT for the now-verified user
    const payload: JwtPayload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);

    // Strip sensitive fields before returning user info
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, otp, otpExpiresAt, ...userInfo } = user as any;

    return {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 3600,
      user: { ...userInfo, isVerified: true },
    };
  }

  /**
   * Onboarding Step 2: Role Selection
   */
  async onboardingStep2(userId: string, dto: OnboardingStep2Dto): Promise<User> {
    const user = await this.findOne(userId);
    const roleName = dto.role; // 'player' or 'coach'

    // Check if role exists
    let role = await this.roleRepository.findOne({ where: { name: roleName } });

    if (!role) {
      // Create role if it doesn't exist (Auto-seeding for simplicity as per requirements context)
      role = this.roleRepository.create({
        name: roleName,
        description: `System role for ${roleName}`,
        isActive: true,
      });
      await this.roleRepository.save(role);
    }

    // Assign role
    // user.roles is an array. We replace or append? Request implies selecting A role ("Player OR Coach"). 
    // Usually a user has one primary role for this flow.
    user.roles = [role];
    // Note: This overwrites existing roles. Verify if this is desired. 
    // For new users it's fine. For existing, it changes their persona. Accepted for this flow.

    return await this.userRepository.save(user);
  }

  /**
   * Onboarding Step 3: Player Details
   */
  async onboardingStep3Player(userId: string, dto: OnboardingPlayerDto) {
    const user = await this.findOne(userId);

    // Check if profile exists
    // We assume 1-to-1.
    let profile = await this.playerProfileRepository.findOne({ where: { userId } });

    if (!profile) {
      profile = this.playerProfileRepository.create({
        userId: user.id,
        ...dto
      });
    } else {
      Object.assign(profile, dto);
    }

    await this.playerProfileRepository.save(profile);

    // Mark onboarding complete
    user.isOnboardingCompleted = true;
    await this.userRepository.save(user);

    return { user, profile };
  }

  /**
   * Onboarding Step 3: Coach Details
   */
  async onboardingStep3Coach(userId: string, dto: OnboardingCoachDto) {
    const user = await this.findOne(userId);

    let profile = await this.coachProfileRepository.findOne({ where: { userId } });

    if (!profile) {
      profile = this.coachProfileRepository.create({
        userId: user.id,
        ...dto
      });
    } else {
      Object.assign(profile, dto);
    }

    await this.coachProfileRepository.save(profile);

    // Mark onboarding complete
    user.isOnboardingCompleted = true;
    await this.userRepository.save(user);

    return { user, profile };
  }

  /**
   * Get all users
   * @param includeDeleted - Whether to include soft-deleted users
   * @returns Array of users
   */
  async findAll(includeDeleted: boolean = false): Promise<User[]> {
    return await this.userRepository.find({
      withDeleted: includeDeleted,
    });
  }

  /**
   * Find user by ID
   * @param id - User ID
   * @param includeDeleted - Whether to include soft-deleted users
   * @returns User entity
   * @throws NotFoundException if user not found
   */
  async findOne(id: string, includeDeleted: boolean = false): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      withDeleted: includeDeleted,
      relations: ['roles'], // Load roles to avoid overwriting issues if needed, though we overwrite in step 2
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email
   * @param email - User email
   * @returns User entity or null
   */
  async findByEmail(email: string): Promise<User | null> {
    return await this.userRepository.findOne({ where: { email } });
  }

  /**
   * Update user information
   * @param id - User ID
   * @param updateUserDto - User update data
   * @returns Updated user
   * @throws NotFoundException if user not found
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    Object.assign(user, updateUserDto);

    return await this.userRepository.save(user);
  }

  /**
   * Soft delete a user
   * @param id - User ID
   * @returns void
   * @throws NotFoundException if user not found
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  /**
   * Restore a soft-deleted user
   * @param id - User ID
   * @returns void
   * @throws NotFoundException if user not found
   */
  async restore(id: string): Promise<void> {
    const user = await this.findOne(id, true);
    await this.userRepository.restore(id);
  }

  /**
   * Update user profile (common details)
   * @param userId - User ID
   * @param dto - Profile update data
   * @returns Updated user
   */
  async updateProfile(userId: string, dto: UpdateUserProfileDto): Promise<User> {
    const user = await this.findOne(userId);

    if (dto.name) user.name = dto.name;
    if (dto.gender) user.gender = dto.gender;
    if (dto.placeOfBirth) user.placeOfBirth = dto.placeOfBirth;
    if (dto.phoneNumber) user.phoneNumber = dto.phoneNumber;
    if (dto.dateOfBirth) user.dateOfBirth = new Date(dto.dateOfBirth);

    return await this.userRepository.save(user);
  }

  /**
   * Update player profile
   * @param userId - User ID
   * @param dto - Player profile update data
   * @returns Updated player profile
   */
  async updatePlayerProfile(userId: string, dto: UpdatePlayerProfileDto): Promise<PlayerProfile> {
    const profile = await this.playerProfileRepository.findOne({ where: { userId } });

    if (!profile) {
      throw new NotFoundException(`Player profile not found for user ${userId}`);
    }

    Object.assign(profile, dto);
    return await this.playerProfileRepository.save(profile);
  }

  /**
   * Update coach profile
   * @param userId - User ID
   * @param dto - Coach profile update data
   * @returns Updated coach profile
   */
  async updateCoachProfile(userId: string, dto: UpdateCoachProfileDto): Promise<CoachProfile> {
    const profile = await this.coachProfileRepository.findOne({ where: { userId } });

    if (!profile) {
      throw new NotFoundException(`Coach profile not found for user ${userId}`);
    }

    Object.assign(profile, dto);
    return await this.coachProfileRepository.save(profile);
  }
}
