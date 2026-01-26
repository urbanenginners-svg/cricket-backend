import {
    Controller,
    Post,
    Body,
    UseGuards,
    Request,
    HttpCode,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';
import { Action } from '../../common/casl/ability.factory';
import { Academy } from './academy.entity';
import { AcademyService } from './academy.service';
import { CreateAcademyDto } from './dto/create-academy.dto';
import { SerializeResponse } from '../../common/decorators/serialize-response.decorator';

@ApiTags('academy')
@ApiBearerAuth('defaultBearerAuth')
@Controller('academy')
@UseGuards(AuthGuard, PermissionsGuard)
export class AcademyController {
    constructor(private readonly academyService: AcademyService) { }

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiOperation({ summary: 'Create a new academy' })
    @ApiResponse({ status: 201, description: 'The academy has been successfully created.' })
    @ApiResponse({ status: 401, description: 'Unauthorized.' })
    @CheckPermissions({ action: Action.CREATE, subject: Academy })
    // @SerializeResponse('user') // Uncomment if we want to filter response based on groups, currently returning plain object or we can use generic
    async create(@Request() req, @Body() createAcademyDto: CreateAcademyDto) {
        return await this.academyService.create(req.user.id, createAcademyDto);
    }
}
