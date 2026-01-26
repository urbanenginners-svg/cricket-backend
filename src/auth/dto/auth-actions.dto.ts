import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail, IsEnum, IsOptional } from 'class-validator';

export class MobileLoginDto {
    @ApiProperty({ example: '9876543210' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;
}

export class VerifyOtpDto {
    @ApiProperty({ example: '9876543210' })
    @IsString()
    @IsNotEmpty()
    phoneNumber: string;

    @ApiProperty({ example: '123456' })
    @IsString()
    @IsNotEmpty()
    otp: string;
}

export class SocialLoginDto {
    @ApiProperty({ example: 'user@example.com' })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({ enum: ['google', 'facebook'] })
    @IsEnum(['google', 'facebook'])
    provider: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    name?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    accessToken?: string; // Potential for real verification later
}
