# GitHub Copilot Instructions — NestJS Backend

This is a **NestJS + TypeORM + PostgreSQL** REST API with JWT authentication and CASL-based RBAC. Follow every rule below when generating any new module, endpoint, or file.

---

## Tech Stack

- **Framework**: NestJS (latest)
- **ORM**: TypeORM with PostgreSQL
- **Auth**: Passport JWT (`@nestjs/passport`, `passport-jwt`)
- **RBAC**: CASL (`@casl/ability`)
- **Validation**: `class-validator` + `class-transformer`
- **Docs**: Swagger (`@nestjs/swagger`)
- **Global API prefix**: `api/v1`

---

## Module File Structure

Every feature module lives under `src/modules/{name}/` and **must** contain exactly these files:

```
src/modules/{name}/
├── {name}.entity.ts
├── {name}.service.ts
├── {name}.controller.ts
├── {name}.module.ts
├── dto/
│   ├── create-{name}.dto.ts
│   └── update-{name}.dto.ts
└── decorators/
    └── {name}.swagger.decorator.ts
```

Use **kebab-case** for all file names (e.g., `player-profile.entity.ts`).  
Use **PascalCase** for all class names (e.g., `PlayerProfileService`).

---

## Entity Rules (`{name}.entity.ts`)

```typescript
import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn,
} from 'typeorm';
import { Expose, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { SerializationGroups } from '../../common/decorators/serialize-response.decorator';

/**
 * {Name} Entity
 * Brief description of what this entity represents
 */
@Entity('{plural_table_name}')            // e.g. @Entity('academies')
export class {Name} {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ description: 'Unique identifier' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  id: string;

  // --- regular columns ---
  @Column({ type: 'varchar', length: 255 })
  @ApiProperty({ description: 'Description of the field' })
  @Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })
  fieldName: string;

  // --- admin-only fields ---
  @Column({ type: 'boolean', default: true })
  @ApiProperty({ description: 'Whether the record is active' })
  @Expose({ groups: [SerializationGroups.ADMIN] })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Creation timestamp' })
  @Expose({ groups: [SerializationGroups.ADMIN] })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @ApiProperty({ description: 'Last update timestamp' })
  @Expose({ groups: [SerializationGroups.ADMIN] })
  updatedAt: Date;

  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  @ApiProperty({ description: 'Soft-delete timestamp', required: false })
  @Expose({ groups: [SerializationGroups.ADMIN] })
  deletedAt?: Date;
}
```

**Rules:**
- Always use `@PrimaryGeneratedColumn('uuid')`.
- Always include `@CreateDateColumn`, `@UpdateDateColumn`, `@DeleteDateColumn` (soft delete).
- Every exposed field needs `@Expose({ groups: [...] })` from `class-transformer`.
- Use `SerializationGroups.ADMIN` for sensitive/internal fields (`isActive`, `createdAt`, `updatedAt`, `deletedAt`).
- Use `SerializationGroups.ADMIN` + `SerializationGroups.USER` for fields regular users may see.
- Sensitive fields like `password` must use `@Exclude()` and `@ApiHideProperty()` — **never** expose them.
- When adding a **relation** (ManyToMany, ManyToOne), use `@Transform` to expose only safe scalar fields of the related entity.
- The new entity **must** be added to `Subjects` type in `src/common/casl/ability.factory.ts`.

---

## DTO Rules

### `create-{name}.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsOptional, MinLength } from 'class-validator';

/**
 * Data Transfer Object for creating a new {Name}
 */
export class Create{Name}Dto {
  @ApiProperty({ description: 'Field description', example: 'example value' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  fieldName: string;

  @ApiProperty({ description: 'Optional field description', required: false })
  @IsOptional()
  @IsString()
  optionalField?: string;
}
```

### `update-{name}.dto.ts`

```typescript
import { PartialType } from '@nestjs/swagger';
import { Create{Name}Dto } from './create-{name}.dto';

/**
 * Data Transfer Object for updating a {Name}
 * All fields are optional (inherited from Create{Name}Dto)
 */
export class Update{Name}Dto extends PartialType(Create{Name}Dto) {}
```

**Rules:**
- Every DTO property needs **both** `@ApiProperty(...)` and a `class-validator` decorator.
- Always import `PartialType` from `@nestjs/swagger` (not `@nestjs/mapped-types`).
- `UpdateDto` always extends `PartialType(CreateDto)`.
- Use `@IsOptional()` for truly optional creation fields.

---

## Service Rules (`{name}.service.ts`)

```typescript
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Create{Name}Dto } from './dto/create-{name}.dto';
import { Update{Name}Dto } from './dto/update-{name}.dto';
import { {Name} } from './{name}.entity';

@Injectable()
export class {Name}Service {
  constructor(
    @InjectRepository({Name})
    private readonly {name}Repository: Repository<{Name}>,
  ) {}

  async create(createDto: Create{Name}Dto): Promise<{Name}> {
    // Check for unique constraint violations before saving
    const existing = await this.{name}Repository.findOne({ where: { name: createDto.name } });
    if (existing) {
      throw new ConflictException(`{Name} with name '${createDto.name}' already exists`);
    }
    const entity = this.{name}Repository.create(createDto);
    return await this.{name}Repository.save(entity);
  }

  async findAll(includeDeleted: boolean = false): Promise<{Name}[]> {
    return await this.{name}Repository.find({
      order: { createdAt: 'DESC' },
      withDeleted: includeDeleted,
    });
  }

  async findOne(id: string, includeDeleted: boolean = false): Promise<{Name}> {
    const entity = await this.{name}Repository.findOne({
      where: { id },
      withDeleted: includeDeleted,
    });
    if (!entity) {
      throw new NotFoundException(`{Name} with ID ${id} not found`);
    }
    return entity;
  }

  async update(id: string, updateDto: Update{Name}Dto): Promise<{Name}> {
    await this.findOne(id);                          // confirms existence
    await this.{name}Repository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.findOne(id);                          // confirms existence
    await this.{name}Repository.softDelete(id);
  }

  async restore(id: string): Promise<void> {
    await this.findOne(id, true);                    // confirms existence including deleted
    await this.{name}Repository.restore(id);
  }
}
```

**Rules:**
- Always use `softDelete` — **never** `delete` or `remove` for permanent deletion.
- Always call `findOne` before `update`/`remove`/`restore` to get a proper `NotFoundException`.
- Throw `ConflictException` for unique constraint violations (name duplicates, etc.).
- Repository property must be `readonly` and `private`.

---

## Controller Rules (`{name}.controller.ts`)

```typescript
import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  HttpCode, HttpStatus, UseGuards, Query, Put,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  Create{Name}Swagger,
  FindAll{Name}sSwagger,
  FindOne{Name}Swagger,
  Update{Name}Swagger,
  Remove{Name}Swagger,
} from './decorators/{name}.swagger.decorator';
import { {Name}Service } from './{name}.service';
import { Create{Name}Dto } from './dto/create-{name}.dto';
import { Update{Name}Dto } from './dto/update-{name}.dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { CheckPermissions } from '../../common/decorators/check-permissions.decorator';
import { SerializeResponse, SerializationGroups } from '../../common/decorators/serialize-response.decorator';
import { Action } from '../../common/casl/ability.factory';
import { {Name} } from './{name}.entity';

/**
 * {Name} Controller
 * Handles HTTP requests for {name} management operations
 */
@ApiTags('{plural-name}')
@ApiBearerAuth('defaultBearerAuth')
@Controller('{plural-name}')
@UseGuards(AuthGuard, PermissionsGuard)
export class {Name}Controller {
  constructor(private readonly {name}Service: {Name}Service) {}

  /** POST /{plural-name} */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @CheckPermissions({ action: Action.CREATE, subject: {Name} })
  @Create{Name}Swagger()
  @SerializeResponse(SerializationGroups.ADMIN)
  async create(@Body() createDto: Create{Name}Dto) {
    return await this.{name}Service.create(createDto);
  }

  /** GET /{plural-name} */
  @Get()
  @CheckPermissions({ action: Action.READ, subject: {Name} })
  @FindAll{Name}sSwagger()
  @SerializeResponse(SerializationGroups.ADMIN, SerializationGroups.USER)
  async findAll(@Query('includeDeleted') includeDeleted?: boolean) {
    return await this.{name}Service.findAll(includeDeleted);
  }

  /** GET /{plural-name}/:id */
  @Get(':id')
  @CheckPermissions({ action: Action.READ, subject: {Name} })
  @FindOne{Name}Swagger()
  @SerializeResponse(SerializationGroups.ADMIN, SerializationGroups.USER)
  async findOne(@Param('id') id: string) {
    return await this.{name}Service.findOne(id);
  }

  /** PATCH /{plural-name}/:id */
  @Patch(':id')
  @CheckPermissions({ action: Action.UPDATE, subject: {Name} })
  @Update{Name}Swagger()
  @SerializeResponse(SerializationGroups.ADMIN)
  async update(@Param('id') id: string, @Body() updateDto: Update{Name}Dto) {
    return await this.{name}Service.update(id, updateDto);
  }

  /** DELETE /{plural-name}/:id  — soft delete, returns 204 No Content */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @CheckPermissions({ action: Action.DELETE, subject: {Name} })
  @Remove{Name}Swagger()
  async remove(@Param('id') id: string) {
    await this.{name}Service.remove(id);
  }

  /** PUT /{plural-name}/:id/restore */
  @Put(':id/restore')
  @HttpCode(HttpStatus.OK)
  @CheckPermissions({ action: Action.UPDATE, subject: {Name} })
  async restore(@Param('id') id: string) {
    await this.{name}Service.restore(id);
    return { message: '{Name} restored successfully' };
  }
}
```

**Rules:**
- Controller-level `@UseGuards(AuthGuard, PermissionsGuard)` — both guards always together.
- Controller-level `@ApiBearerAuth('defaultBearerAuth')` — use exactly this string.
- HTTP status codes: `POST` → `201 CREATED`, `DELETE` → `204 NO_CONTENT`, all others default to `200 OK`.
- `@SerializeResponse(...)` always on every handler that returns data.
- Every handler has its own dedicated Swagger decorator from `decorators/{name}.swagger.decorator.ts`.
- Route param IDs are always typed as `string` (UUIDs come in as strings).

---

## Swagger Decorator Rules (`decorators/{name}.swagger.decorator.ts`)

```typescript
import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation, ApiResponse, ApiParam, ApiQuery,
  ApiBadRequestResponse, ApiNotFoundResponse,
  ApiForbiddenResponse, ApiConflictResponse, ApiOkResponse,
} from '@nestjs/swagger';

export function Create{Name}Swagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Create a new {name}' }),
    ApiResponse({
      status: 201,
      description: '{Name} successfully created',
      schema: { example: { id: 'uuid', /* ...fields */ } },
    }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiForbiddenResponse({ description: 'Insufficient permissions' }),
    ApiConflictResponse({ description: '{Name} already exists' }),
  );
}

export function FindAll{Name}sSwagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get all {plural-name}' }),
    ApiQuery({ name: 'includeDeleted', required: false, type: Boolean }),
    ApiOkResponse({ description: 'List of {plural-name}' }),
    ApiForbiddenResponse({ description: 'Insufficient permissions' }),
  );
}

export function FindOne{Name}Swagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Get a {name} by ID' }),
    ApiParam({ name: 'id', description: '{Name} UUID', example: 'uuid-here' }),
    ApiOkResponse({ description: '{Name} found' }),
    ApiNotFoundResponse({ description: '{Name} not found' }),
    ApiForbiddenResponse({ description: 'Insufficient permissions' }),
  );
}

export function Update{Name}Swagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Update a {name} by ID' }),
    ApiParam({ name: 'id', description: '{Name} UUID' }),
    ApiOkResponse({ description: '{Name} updated' }),
    ApiNotFoundResponse({ description: '{Name} not found' }),
    ApiBadRequestResponse({ description: 'Validation failed' }),
    ApiForbiddenResponse({ description: 'Insufficient permissions' }),
  );
}

export function Remove{Name}Swagger() {
  return applyDecorators(
    ApiOperation({ summary: 'Soft delete a {name} by ID' }),
    ApiParam({ name: 'id', description: '{Name} UUID' }),
    ApiResponse({ status: 204, description: '{Name} deleted' }),
    ApiNotFoundResponse({ description: '{Name} not found' }),
    ApiForbiddenResponse({ description: 'Insufficient permissions' }),
  );
}
```

**Rules:**
- One exported function per operation.
- Always use `applyDecorators(...)` to compose multiple Swagger decorators.
- Always provide a `schema.example` for 2xx responses.
- Always include `ApiForbiddenResponse` on every protected endpoint.

---

## Module Rules (`{name}.module.ts`)

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { {Name}Controller } from './{name}.controller';
import { {Name}Service } from './{name}.service';
import { {Name} } from './{name}.entity';
import { User } from '../user/user.entity';
import { AbilityFactory } from '../../common/casl/ability.factory';

@Module({
  imports: [TypeOrmModule.forFeature([{Name}, User])],
  controllers: [{Name}Controller],
  providers: [{Name}Service, AbilityFactory],
  exports: [{Name}Service],
})
export class {Name}Module {}
```

**Rules:**
- Always include `User` in `TypeOrmModule.forFeature` (required by `AbilityFactory`).
- Always provide `AbilityFactory` so `PermissionsGuard` works.
- Export the service so other modules can inject it.

---

## Registering a New Module in `app.module.ts`

1. Import the new module class at the top.
2. Add it to the `imports` array.
3. Add a new `.addTag('{plural-name}', '...')` in the Swagger `DocumentBuilder` chain inside `main.ts`.

---

## Registering a New Entity in CASL (`ability.factory.ts`)

Add the entity to the `Subjects` union type:

```typescript
import { {Name} } from '../../modules/{name}/{name}.entity';

export type Subjects =
  | InferSubjects<
    | typeof User
    | typeof Role
    | typeof Permission
    | typeof File
    | typeof {Name}          // ← add here
    // ...
  >
  | 'all'
  | 'user_profile';
```

---

## API Response Format

### Success response (all `2xx` routes)

The global `TransformInterceptor` wraps every response automatically:

```json
{
  "data": { /* entity or array */ },
  "statusCode": 200,
  "timestamp": "2026-03-08T10:00:00.000Z"
}
```

### Error response

The global `HttpExceptionFilter` returns:

```json
{
  "statusCode": 404,
  "timestamp": "2026-03-08T10:00:00.000Z",
  "message": "Resource with ID uuid not found",
  "error": "Not Found"
}
```

**Never** construct raw error or success response objects inside controllers or services — let the global interceptor/filter handle the shape.

---

## Serialization Groups

Three serialization groups are defined in `SerializationGroups` enum:

| Group | Who sees it | Typical fields |
|-------|-------------|----------------|
| `SerializationGroups.PUBLIC` | Unauthenticated users | Minimal public info |
| `SerializationGroups.USER` | Authenticated regular users | Core business fields |
| `SerializationGroups.ADMIN` | Admin / superadmin | All fields incl. `isActive`, timestamps, relations |

- Use `@Expose({ groups: [SerializationGroups.ADMIN, SerializationGroups.USER] })` on fields that both roles need.
- Use `@Expose({ groups: [SerializationGroups.ADMIN] })` on admin-only fields.
- `@SerializeResponse(SerializationGroups.ADMIN, SerializationGroups.USER)` on `findAll`/`findOne` handlers.
- `@SerializeResponse(SerializationGroups.ADMIN)` on `create`/`update` handlers.

---

## Authentication Pattern

- Every module uses `@UseGuards(AuthGuard, PermissionsGuard)` at the **class level**.
- Use `@Public()` decorator (from `src/common/decorators/public.decorator.ts`) only on endpoints that must be publicly accessible (e.g., login).
- To access the current logged-in user inside a handler, use:
  ```typescript
  @Get('me')
  async getMe(@Request() req) {
    return req.user; // populated by JwtStrategy
  }
  ```

---

## Permissions Pattern

```typescript
// In controller handler:
@CheckPermissions({ action: Action.CREATE, subject: {Name} })

// Action enum values:
// Action.MANAGE  — any action (superadmin only)
// Action.CREATE
// Action.READ
// Action.UPDATE
// Action.DELETE
```

---

## Naming Conventions Summary

| Thing | Convention | Example |
|-------|-----------|---------|
| File names | `kebab-case` | `player-profile.entity.ts` |
| Class names | `PascalCase` | `PlayerProfileService` |
| Method names | `camelCase` | `findAll` |
| DB table names | `snake_case` plural | `player_profiles` |
| Route paths | `kebab-case` plural | `/player-profiles` |
| DTO class | `PascalCase` + suffix | `CreatePlayerProfileDto` |
| Swagger decorator | `PascalCase` + Swagger | `CreatePlayerProfileSwagger` |

---

## Checklist When Adding a New Module

- [ ] Create `src/modules/{name}/` directory with all 6 files
- [ ] Entity: UUID PK, soft delete columns, `@Expose` groups, `@ApiProperty`
- [ ] DTOs: `class-validator` + `@ApiProperty`, `UpdateDto` extends `PartialType(CreateDto)`
- [ ] Service: CRUD + `softDelete` + `restore`, throws `NotFoundException`/`ConflictException`
- [ ] Controller: class-level guards + `@ApiTags` + `@ApiBearerAuth`, per-method `@CheckPermissions` + `@SerializeResponse` + swagger decorator
- [ ] Swagger decorators: one function per operation, `applyDecorators` + proper response examples
- [ ] Module: register entity, `User`, and `AbilityFactory`
- [ ] `ability.factory.ts`: add entity to `Subjects` type
- [ ] `app.module.ts`: import and register module
- [ ] `main.ts`: add `.addTag(...)` to Swagger config
- [ ] Generate and run a TypeORM migration for the new table
