import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsNumber, IsUrl, IsNotEmpty } from 'class-validator';

export class CreateAcademyDto {
    // Step 1
    @ApiProperty({ description: 'Name of the academy' })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiPropertyOptional({ description: 'Description of the academy' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ description: 'Full address' })
    @IsString()
    @IsOptional()
    address?: string;

    @ApiPropertyOptional({ description: 'City' })
    @IsString()
    @IsOptional()
    city?: string;

    @ApiPropertyOptional({ description: 'Pin code' })
    @IsString()
    @IsOptional()
    pinCode?: string;

    @ApiPropertyOptional({ description: 'State' })
    @IsString()
    @IsOptional()
    state?: string;

    @ApiPropertyOptional({ description: 'Google Map Link' })
    @IsString()
    @IsOptional()
    googleMapLink?: string;

    @ApiPropertyOptional({ description: 'Cover media (images)', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    coverMedia?: string[];

    // Step 2
    @ApiPropertyOptional({ description: 'Head Coach Name' })
    @IsString()
    @IsOptional()
    headCoach?: string;

    @ApiPropertyOptional({ description: 'Established Year' })
    @IsNumber()
    @IsOptional()
    establishedYear?: number;

    @ApiPropertyOptional({ description: 'Fees Range (monthly)' })
    @IsString()
    @IsOptional()
    feesRange?: string;

    @ApiPropertyOptional({ description: 'Start Time' })
    @IsString()
    @IsOptional()
    startTime?: string;

    @ApiPropertyOptional({ description: 'End Time' })
    @IsString()
    @IsOptional()
    endTime?: string;

    @ApiPropertyOptional({ description: 'Age Groups', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    ageGroups?: string[];

    // Step 3
    @ApiPropertyOptional({ description: 'Phone number' })
    @IsString()
    @IsOptional()
    phone?: string;

    @ApiPropertyOptional({ description: 'Email address' })
    @IsString()
    @IsOptional()
    // @IsEmail() // Optional validation, can add if needed
    email?: string;

    @ApiPropertyOptional({ description: 'Instagram Link' })
    @IsString()
    @IsOptional()
    instagramLink?: string;

    @ApiPropertyOptional({ description: 'Website Link' })
    @IsString()
    @IsOptional()
    websiteLink?: string;

    // Step 4
    @ApiPropertyOptional({ description: 'Ground Name' })
    @IsString()
    @IsOptional()
    groundName?: string;

    @ApiPropertyOptional({ description: 'Available Turfs', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    availableTurfs?: string[];

    @ApiPropertyOptional({ description: 'Number of Pitches' })
    @IsNumber()
    @IsOptional()
    numberOfPitches?: number;

    @ApiPropertyOptional({ description: 'Practice Nets count' })
    @IsNumber()
    @IsOptional()
    practiceNets?: number;

    @ApiPropertyOptional({ description: 'Boundary Length (Approx)' })
    @IsString()
    @IsOptional()
    boundaryLength?: string;

    @ApiPropertyOptional({ description: 'Media images', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    media?: string[];

    // Step 5
    @ApiPropertyOptional({ description: 'Facilities', type: [String] })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    facilities?: string[];
}
