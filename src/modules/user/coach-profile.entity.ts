import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('coach_profiles')
export class CoachProfile {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({ nullable: true })
    @ApiProperty()
    coachingRole: string;

    @Column({ nullable: true })
    @ApiProperty()
    experience: string;

    @Column({ nullable: true })
    @ApiProperty()
    certifications: string;

    @Column({ nullable: true })
    @ApiProperty()
    specialization: string;

    @Column({ nullable: true })
    @ApiProperty()
    preferredAgeGroupToCoach: string;

    @Column({ nullable: true })
    @ApiProperty()
    currentCity: string;

    @Column({ nullable: true })
    @ApiProperty()
    visibilityPreference: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
