import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../user/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('academies')
export class Academy {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    // Step 1
    @Column()
    @ApiProperty()
    name: string;

    @Column({ type: 'text', nullable: true })
    @ApiProperty()
    description: string;

    @Column({ nullable: true })
    @ApiProperty()
    address: string;

    @Column({ nullable: true })
    @ApiProperty()
    city: string;

    @Column({ nullable: true })
    @ApiProperty()
    pinCode: string;

    @Column({ nullable: true })
    @ApiProperty()
    state: string;

    @Column({ nullable: true })
    @ApiProperty()
    googleMapLink: string;

    @Column({ type: 'json', nullable: true })
    @ApiProperty()
    coverMedia: string[];

    // Step 2
    @Column({ nullable: true })
    @ApiProperty()
    headCoach: string;

    @Column({ nullable: true })
    @ApiProperty()
    establishedYear: number;

    @Column({ nullable: true })
    @ApiProperty()
    feesRange: string;

    @Column({ nullable: true })
    @ApiProperty()
    startTime: string;

    @Column({ nullable: true })
    @ApiProperty()
    endTime: string;

    @Column({ type: 'json', nullable: true })
    @ApiProperty()
    ageGroups: string[];

    // Step 3
    @Column({ nullable: true })
    @ApiProperty()
    phone: string;

    @Column({ nullable: true })
    @ApiProperty()
    email: string;

    @Column({ nullable: true })
    @ApiProperty()
    instagramLink: string;

    @Column({ nullable: true })
    @ApiProperty()
    websiteLink: string;

    // Step 4
    @Column({ nullable: true })
    @ApiProperty()
    groundName: string;

    @Column({ type: 'json', nullable: true })
    @ApiProperty()
    availableTurfs: string[];

    @Column({ nullable: true })
    @ApiProperty()
    numberOfPitches: number;

    @Column({ nullable: true })
    @ApiProperty()
    practiceNets: number;

    @Column({ nullable: true })
    @ApiProperty()
    boundaryLength: string;

    @Column({ type: 'json', nullable: true })
    @ApiProperty()
    media: string[];

    // Step 5
    // Facilities list: Umpires, Flood Lights, Sight Screen, Scorers, Balls, Cafateria, Drinking Water, Washrooms, Parking, Practice Nets, Pavilion, First Aid
    @Column({ type: 'json', nullable: true })
    @ApiProperty()
    facilities: string[];

    // Relations
    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'owner_id' })
    owner: User;

    @Column({ type: 'uuid' })
    ownerId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
