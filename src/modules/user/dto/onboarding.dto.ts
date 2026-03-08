import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsBoolean, IsMobilePhone } from 'class-validator';
import { Gender } from '../../../types/enums/gender.enum';

export class OnboardingStep1Dto {
    @ApiProperty({ example: '+919876543210', description: 'Phone number with country code' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: 'John Doe', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ enum: Gender, example: Gender.Male })
    @IsEnum(Gender)
    @IsNotEmpty()
    gender: Gender;

    @ApiProperty({ example: '1990-01-01' })
    @IsDateString()
    @IsNotEmpty()
    dateOfBirth: string; // ISO date string

    @ApiProperty({ example: 'Mumbai' })
    @IsString()
    @IsNotEmpty()
    placeOfBirth: string;
}

export class VerifyOnboardingOtpDto {
    @ApiProperty({ example: '+919876543210', description: 'Phone number used in step 1' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: '483920', description: '6-digit OTP sent to the phone number' })
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class OnboardingStep2Dto {
    @ApiProperty({ enum: ['player', 'coach'] })
    @IsEnum(['player', 'coach'])
    @IsNotEmpty()
    role: string;
}

export class OnboardingPlayerDto {
    @ApiProperty({ enum: ['batter', 'bowler', 'keeper', 'all_rounder'] })
    @IsEnum(['batter', 'bowler', 'keeper', 'all_rounder'])
    @IsNotEmpty()
    playerRole: string;

    // Batter / All Rounder
    @ApiProperty({ required: false, example: 'Right-hand' })
    @IsOptional()
    @IsString()
    battingType?: string;

    @ApiProperty({ required: false, example: 'Top Order' })
    @IsOptional()
    @IsString()
    battingOrder?: string;

    // Bowler / All Rounder / Keeper
    @ApiProperty({ required: false, example: 'Pace' })
    @IsOptional()
    @IsString()
    bowlingType?: string;

    @ApiProperty({ required: false, example: 'Fast' })
    @IsOptional()
    @IsString()
    bowlingStyle?: string;
}

export class OnboardingCoachDto {
    @ApiProperty({ example: 'Head Coach' })
    @IsString()
    @IsOptional()
    coachingRole: string;

    @ApiProperty({ example: '5 years' })
    @IsString()
    @IsOptional()
    experience: string;

    @ApiProperty({ example: 'ICC Level 1' })
    @IsString()
    @IsOptional()
    certifications: string;

    @ApiProperty({ example: 'Batting' })
    @IsString()
    @IsOptional()
    specialization: string;

    @ApiProperty({ example: 'Under 19' })
    @IsString()
    @IsOptional()
    preferredAgeGroupToCoach: string;

    @ApiProperty({ example: 'Delhi' })
    @IsString()
    @IsOptional()
    currentCity: string;

    @ApiProperty({ example: 'Public' })
    @IsString()
    @IsOptional()
    visibilityPreference: string;
}
