import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude, Expose, Transform } from 'class-transformer';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Role } from '../role/role.entity';
import { SerializationGroups } from '../../common/decorators/serialize-response.decorator';

/**
 * User Entity
 * Represents a user in the system with authentication and profile information
 */
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier for the user' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: 'Full name of the user' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true, nullable: true })
  @ApiProperty({ description: 'Email address of the user' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  email: string;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  @ApiProperty({ description: 'Phone number of the user' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: ['local', 'google', 'facebook', 'mobile'],
    default: 'local',
  })
  @ApiProperty({ description: 'Authentication provider' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  authProvider: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiHideProperty() // Never expose password in API responses
  @Exclude() // Always exclude password from serialization
  password: string;

  @Column({ type: 'boolean', default: false })
  @ApiProperty({ description: 'Whether the user has completed onboarding' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  isOnboardingCompleted: boolean;

  // Basic Profile Info
  @Column({ type: 'varchar', length: 20, nullable: true })
  @ApiProperty({ description: 'Gender of the user' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  gender: string;

  @Column({ type: 'date', nullable: true })
  @ApiProperty({ description: 'Date of birth' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  @ApiProperty({ description: 'Place of birth' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  placeOfBirth: string;

  // OTP fields
  @Column({ type: 'varchar', length: 10, nullable: true, select: false })
  @Exclude()
  otp: string;

  @Column({ type: 'timestamp', nullable: true, select: false })
  @Exclude()
  otpExpiresAt: Date;

  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether the user account is active' })
  @Expose({ groups: ['admin'] })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'When the user was created' })
  @Expose({ groups: ['admin'] })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'When the user was last updated' })
  @Expose({ groups: ['admin'] })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @ApiProperty({
    description: 'When the user was soft deleted',
    required: false,
  })
  @Expose({ groups: ['admin'] })
  deletedAt?: Date;

  // Many-to-many relationship with Roles
  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' },
  })
  @ApiProperty({
    description: 'Roles assigned to the user',
    type: () => [Role],
  })
  @Expose({ groups: ['admin', 'user'] })
  @Transform(
    ({ value }) =>
      value?.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
      })) || [],
  )
  roles: Role[];
}
