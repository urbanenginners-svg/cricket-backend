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

@Entity('player_profiles')
export class PlayerProfile {
    @PrimaryGeneratedColumn('uuid')
    @ApiProperty()
    id: string;

    @OneToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({ type: 'uuid' })
    userId: string;

    @Column({
        type: 'enum',
        enum: ['batter', 'bowler', 'keeper', 'all_rounder'],
    })
    @ApiProperty()
    playerRole: string; // batter, bowler, keeper, all_rounder

    // Batter / All Rounder fields
    @Column({ nullable: true })
    @ApiProperty()
    battingType: string;

    @Column({ nullable: true })
    @ApiProperty()
    battingOrder: string;

    // Bowler / All Rounder / Keeper (as per request) fields
    @Column({ nullable: true })
    @ApiProperty()
    bowlingType: string;

    @Column({ nullable: true })
    @ApiProperty()
    bowlingStyle: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
