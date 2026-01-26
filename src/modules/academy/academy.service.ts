import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Academy } from './academy.entity';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AcademyService {
    constructor(
        @InjectRepository(Academy)
        private readonly academyRepository: Repository<Academy>,
    ) { }

    async create(userId: string, createAcademyDto: CreateAcademyDto): Promise<Academy> {
        const academy = this.academyRepository.create({
            ...createAcademyDto,
            ownerId: userId,
        });
        return await this.academyRepository.save(academy);
    }

    async findAll(): Promise<Academy[]> {
        return await this.academyRepository.find();
    }

    async findOne(id: string): Promise<Academy> {
        return await this.academyRepository.findOne({ where: { id } });
    }
}
