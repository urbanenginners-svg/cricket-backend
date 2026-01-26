import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Academy } from './academy.entity';
import { AcademyController } from './academy.controller';
import { AcademyService } from './academy.service';

@Module({
    imports: [TypeOrmModule.forFeature([Academy])],
    controllers: [AcademyController],
    providers: [AcademyService],
    exports: [AcademyService],
})
export class AcademyModule { }
