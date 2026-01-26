import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { OnboardingCoachDto, OnboardingPlayerDto } from './onboarding.dto';

export class UpdateUserProfileDto {
    @ApiProperty({ example: 'John Doe', required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ example: 'Male', required: false })
    @IsOptional()
    @IsString()
    gender?: string;

    @ApiProperty({ example: '1990-01-01', required: false })
    @IsOptional()
    @IsDateString()
    dateOfBirth?: string;

    @ApiProperty({ example: 'Mumbai', required: false })
    @IsOptional()
    @IsString()
    placeOfBirth?: string;

    @ApiProperty({ example: '9876543210', required: false })
    @IsOptional()
    @IsString()
    phoneNumber?: string;
}

export class UpdatePlayerProfileDto extends PartialType(OnboardingPlayerDto) { }

export class UpdateCoachProfileDto extends PartialType(OnboardingCoachDto) { }
