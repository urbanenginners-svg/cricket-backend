import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { PlayerProfile } from './player-profile.entity';
import { CoachProfile } from './coach-profile.entity';
import { Role } from '../role/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { OnboardingStep1Dto, OnboardingStep2Dto, OnboardingPlayerDto, OnboardingCoachDto } from './dto/onboarding.dto';

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
   * Onboarding Step 1: Basic Info
   */
  async onboardingStep1(userId: string, dto: OnboardingStep1Dto): Promise<User> {
    const user = await this.findOne(userId);

    // Convert string date to Date object if needed, or TypeORM handles it
    // Using Object.assign or specific fields
    user.gender = dto.gender;
    user.dateOfBirth = new Date(dto.dateOfBirth);
    user.placeOfBirth = dto.placeOfBirth;
    if (dto.name) {
      user.name = dto.name;
    }

    return await this.userRepository.save(user);
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
}
