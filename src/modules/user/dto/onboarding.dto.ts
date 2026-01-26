import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString, IsBoolean } from 'class-validator';

export class OnboardingStep1Dto {
    @ApiProperty({ example: 'Male' })
    @IsString()
    @IsNotEmpty()
    gender: string;

    @ApiProperty({ example: '1990-01-01' })
    @IsDateString()
    @IsNotEmpty()
    dateOfBirth: string; // ISO date string

    @ApiProperty({ example: 'Mumbai' })
    @IsString()
    @IsNotEmpty()
    placeOfBirth: string;

    // Since step 1 mentions fullName, we might allow updating name if it was empty from mobile login
    @ApiProperty({ example: 'John Doe', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    // Phone number might technically be Step 1 if not provided, but it was part of auth. 
    // We assume auth is done.
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
