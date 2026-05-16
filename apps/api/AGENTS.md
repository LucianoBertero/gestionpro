# AGENTS.md — API Backend (NestJS + Prisma)

> **Leer antes de generar cualquier código en el backend.** Este archivo es la fuente de verdad de patrones y convenciones para el backend.

## Stack

NestJS 11 · Prisma 7 + `@prisma/adapter-pg` (pg Pool, no Prisma binary engine) · PostgreSQL · Redis (ioredis via `CacheService`) · BullMQ · JWT (passport-jwt, argon2) · nestjs-pino · nestjs-i18n · Sentry · Swagger (non-production only) · TypeScript 6 · Node >= 20

## Comandos

```bash
npm run dev               # nest start --watch
npm run build             # nest build -> dist/
npm start                 # node dist/main
npm test                  # jest --coverage --runInBand --forceExit
npm run lint:fix          # eslint --fix
npm run format            # prettier --write
npm run db:generate       # prisma generate --config prisma/prisma.config.ts
npm run db:migrate        # prisma migrate dev
npm run db:migrate-prod   # prisma migrate deploy
npm run seed:admin        # npm run cli -- seed:admin
npm run remove:admin      # npm run cli -- remove:admin
```

## Estructura de Directorios

```
src/
├── app/
│   ├── app.module.ts           ← root module (ver Module Wiring abajo)
│   ├── controllers/
│   │   └── health.controller.ts
│   └── enums/
│       └── app.enum.ts         ← APP_ENVIRONMENT enum
├── common/
│   ├── common.module.ts        ← importa ConfigModule + toda la infra; exporta DatabaseModule, CacheModule
│   ├── config/                 ← registerAs() factories; NUNCA importar directo desde otro lado
│   │   ├── index.ts            ← barrel: [AppConfig, AuthConfig, DocConfig, RedisConfig, SeedConfig]
│   │   ├── app.config.ts       ← keys 'app.*'
│   │   ├── auth.config.ts      ← keys 'auth.accessToken.*' / 'auth.refreshToken.*'
│   │   ├── doc.config.ts       ← keys 'doc.*'
│   │   ├── redis.config.ts     ← keys 'redis.*'
│   │   └── seed.config.ts      ← keys 'seed.admin.*'
│   ├── bullmq/                 ← BullMqModule (conexión Redis compartida)
│   ├── cache/
│   │   ├── cache.module.ts
│   │   ├── constants/cache.constant.ts   ← REDIS_CLIENT token
│   │   └── services/cache.service.ts     ← CacheService (wrapper ioredis)
│   ├── database/
│   │   ├── database.module.ts            ← provee + exporta DatabaseService, UserRepository
│   │   ├── services/database.service.ts  ← PrismaClient via PrismaPg adapter
│   │   ├── repositories/user.repository.ts
│   │   ├── interfaces/user.interface.ts  ← UserEntity, CreateUserInput, UpdateUserInput
│   │   └── enums/role.enum.ts           ← re-exporta Prisma Role como UserRole
│   ├── doc/
│   │   └── decorators/
│   │       ├── doc.api-endpoint.decorator.ts  ← @ApiEndpoint (EL decorador para todos los métodos)
│   │       ├── doc.response.decorator.ts
│   │       ├── doc.generic.decorator.ts
│   │       └── doc.paginated.decorator.ts
│   ├── logger/
│   │   └── services/logger.service.ts
│   ├── message/
│   │   └── services/message.service.ts   ← resolución i18n
│   ├── request/
│   │   ├── request.module.ts             ← registra 3 APP_GUARD
│   │   ├── constants/request.constant.ts ← PUBLIC_ROUTE_KEY, ROLES_KEY
│   │   ├── decorators/
│   │   │   ├── auth-user.decorator.ts    ← @AuthUser()
│   │   │   ├── public.decorator.ts       ← @PublicRoute()
│   │   │   └── roles.decorator.ts        ← @AllowedRoles([...])
│   │   ├── guards/
│   │   │   ├── jwt-access.guard.ts
│   │   │   ├── jwt-refresh.guard.ts      ← solo en refresh endpoint
│   │   │   └── roles.guard.ts
│   │   └── interfaces/request.interface.ts  ← IAuthUser, IRequest
│   └── response/
│       ├── response.module.ts
│       ├── dtos/
│       │   ├── response.success.dto.ts    ← ApiSuccessResponseDto<T>
│       │   ├── response.generic.dto.ts    ← ApiGenericResponseDto
│       │   ├── response.paginated.dto.ts
│       │   └── response.error.dto.ts
│       ├── filters/response.exception.filter.ts
│       ├── interceptors/response.interceptor.ts
│       └── services/
│           ├── response.serializer.service.ts
│           └── response.sentry.service.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── controllers/auth.public.controller.ts
│   │   ├── dtos/
│   │   │   ├── auth.login.dto.ts    ← UserLoginDto
│   │   │   ├── auth.signup.dto.ts   ← UserCreateDto extends UserLoginDto
│   │   │   └── auth.response.dto.ts ← TokenDto, AuthResponseDto, AuthRefreshResponseDto
│   │   ├── providers/
│   │   │   ├── jwt-access.strategy.ts
│   │   │   └── jwt-refresh.strategy.ts
│   │   └── services/auth.service.ts
│   └── user/
│       ├── user.module.ts
│       ├── controllers/
│       │   ├── user.public.controller.ts  ← GET /v1/user/profile, PUT /v1/user
│       │   └── user.admin.controller.ts   ← DELETE /v1/admin/user/:id
│       ├── dtos/
│       │   ├── user.dto.ts        ← UserResponseDto, UserGetProfileResponseDto, UserUpdateProfileResponseDto
│       │   └── user.update.dto.ts ← UserUpdateDto
│       └── services/user.service.ts
├── workers/
│   ├── worker.module.ts
│   └── schedulers/midnight.scheduler.ts
└── migration/
    ├── migration.module.ts
    └── seeds/user.seed.ts
```

## Module Wiring

**AppModule** (`src/app/app.module.ts`) imports:
```
ConfigModule.forRoot({ load: configs, isGlobal: true, cache: true })
TerminusModule
CommonModule      ← toda la infraestructura
WorkerModule      ← cron schedulers
AuthModule        ← feature
UserModule        ← feature
```

**CommonModule** importa `DatabaseModule, CustomLoggerModule, RequestModule, ResponseModule, CacheModule, BullMqModule` y **exporta solo** `DatabaseModule, CacheModule`.

**Feature modules** (`AuthModule`, `UserModule`) importan `DatabaseModule` directamente — NUNCA se importan entre sí.

**Agregar un nuevo feature module:**
1. Crear `src/modules/<name>/<name>.module.ts` con `imports: [DatabaseModule]`
2. Agregar `<Name>Module` a los imports de `AppModule`

**Agregar un nuevo repository:**
1. Crear `src/common/database/repositories/<name>.repository.ts`
2. Agregar a `providers` y `exports` en `src/common/database/database.module.ts`

## Guard Order & Auth Decorators

`RequestModule` registra guards en este orden exacto via `APP_GUARD`:
1. `ThrottlerGuard` — rate limiting (config: `app.throttle.ttl` = 60s, `app.throttle.limit` = 10 req)
2. `JwtAccessGuard` — validación JWT; se saltea con metadata `@PublicRoute()`
3. `RolesGuard` — chequeo de roles; se saltea sin metadata `@AllowedRoles`

| Decorator | Import desde | Efecto |
|---|---|---|
| `@PublicRoute()` | `src/common/request/decorators/public.decorator` | Bypassea JwtAccessGuard |
| `@AllowedRoles([UserRole.SOCIO])` | `src/common/request/decorators/roles.decorator` | **Array requerido**; RolesGuard verifica `request.user.role` |
| `@AuthUser()` | `src/common/request/decorators/auth-user.decorator` | Extrae `IAuthUser` de `request.user` |
| `@UseGuards(JwtRefreshGuard)` | guard + `@nestjs/common` | Solo en el endpoint refresh-token |

`IAuthUser = { userId: string, role: UserRole }` — definido en `src/common/request/interfaces/request.interface.ts`

**Rutas existentes:**
- `POST /v1/auth/login` — `@PublicRoute()` a nivel clase
- `POST /v1/auth/signup` — `@PublicRoute()` a nivel clase
- `GET /v1/auth/refresh-token` — `@UseGuards(JwtRefreshGuard)` + `@ApiBearerAuth('refreshToken')`
- `GET /v1/user/profile` — JWT-protected, usa `@AuthUser()`
- `PUT /v1/user` — JWT-protected, usa `@AuthUser()`
- `DELETE /v1/admin/user/:id` — `@AllowedRoles([UserRole.SOCIO])` a nivel clase
- `GET /health` — `VERSION_NEUTRAL`, `@PublicRoute()`

## Config Factory Pattern

Las keys de config usan dot-path reflejando el nesting de `registerAs`. Siempre `ConfigService.getOrThrow<T>(key)` — NUNCA `process.env` en services/controllers.

```typescript
// src/common/config/auth.config.ts
export default registerAs('auth', () => ({
    accessToken: {
        secret: process.env.AUTH_ACCESS_TOKEN_SECRET,
        tokenExp: process.env.AUTH_ACCESS_TOKEN_EXP,
    },
    refreshToken: {
        secret: process.env.AUTH_REFRESH_TOKEN_SECRET,
        tokenExp: process.env.AUTH_REFRESH_TOKEN_EXP,
    },
}));

// Uso en service:
this.configService.getOrThrow<string>('auth.accessToken.secret')
this.configService.getOrThrow<string>('auth.refreshToken.tokenExp')
```

**Namespaces de config disponibles:**
- `app.env`, `app.name`, `app.http.host`, `app.http.port`, `app.throttle.ttl`, `app.throttle.limit`, `app.cors`, `app.debug`, `app.logLevel`
- `auth.accessToken.secret`, `auth.accessToken.tokenExp`, `auth.refreshToken.secret`, `auth.refreshToken.tokenExp`
- `redis.url`
- `doc.*`
- `seed.admin.*`

## Database / Repository Pattern

`DatabaseService` wrappea `PrismaClient` con `PrismaPg` adapter. Expone delegates de Prisma directamente: `this.db.user.*`, `this.db.post.*`, etc.

```typescript
// Repository — src/common/database/repositories/user.repository.ts
@Injectable()
export class UserRepository {
    constructor(private readonly db: DatabaseService) {}

    findById(id: string): Promise<UserEntity | null> {
        return this.db.user.findUnique({ where: { id } });
    }

    findByEmail(email: string): Promise<UserEntity | null> {
        return this.db.user.findUnique({ where: { email } });
    }

    async existsById(id: string): Promise<boolean> {
        const found = await this.db.user.findUnique({ where: { id }, select: { id: true } });
        return found !== null;
    }

    async existsByEmail(email: string): Promise<boolean> {
        const found = await this.db.user.findUnique({ where: { email }, select: { id: true } });
        return found !== null;
    }

    create(data: CreateUserInput): Promise<UserEntity> {
        const { password, ...rest } = data;
        return this.db.user.create({ data: { ...rest, passwordHash: password } });
    }

    update(id: string, data: UpdateUserInput): Promise<UserEntity> {
        return this.db.user.update({ where: { id }, data });
    }

    softDelete(id: string): Promise<UserEntity> {
        return this.db.user.update({ where: { id }, data: { deletedAt: new Date() } });
    }

    async hardDeleteByEmail(email: string): Promise<number> {
        const result = await this.db.user.deleteMany({ where: { email } });
        return result.count;
    }
}
```

Reglas:
- Checks de existencia: `findUnique({ select: { id: true } })` — nunca `count`, nunca `findFirst`
- Soft delete: `deletedAt: new Date()` — nunca `delete()`
- `hardDelete*` solo para limpieza de tests
- Tipos de retorno usan interfaces `*Entity`, no Prisma crudo con `as any`

## Service Pattern

```typescript
// src/modules/user/services/user.service.ts
@Injectable()
export class UserService {
    private readonly logger = new Logger(UserService.name);

    constructor(private readonly userRepository: UserRepository) {}

    async getProfile(userId: string): Promise<UserGetProfileResponseDto> {
        const user = await this.userRepository.findById(userId);
        if (!user) throw new HttpException('user.error.userNotFound', HttpStatus.NOT_FOUND);
        return user;
    }

    async updateUser(userId: string, data: UserUpdateDto): Promise<UserUpdateProfileResponseDto> {
        await this.assertExists(userId);
        return this.userRepository.update(userId, data);
    }

    async deleteUser(userId: string): Promise<ApiGenericResponseDto> {
        await this.assertExists(userId);
        await this.userRepository.softDelete(userId);
        return { success: true, message: 'user.success.userDeleted' };
    }

    private async assertExists(userId: string): Promise<void> {
        const exists = await this.userRepository.existsById(userId);
        if (!exists) throw new HttpException('user.error.userNotFound', HttpStatus.NOT_FOUND);
    }
}
```

Reglas:
- Inyectar repositories (no `DatabaseService` directamente)
- Logger: `private readonly logger = new Logger(ClassName.name)` — solo loggear errores 5xx inesperados
- Errores: `throw new HttpException('domain.error.key', HttpStatus.STATUS)` — siempre string i18n key
- `private async assertExists(id)` para checks de existencia repetidos
- Boolean success: retornar `{ success: true, message: 'domain.success.key' }` (objeto plano que matchea `ApiGenericResponseDto`)

## Controller Pattern

```typescript
// Public controller
@ApiTags('public.user')
@ApiBearerAuth('accessToken')
@Controller({ path: '/user', version: '1' })
export class UserPublicController {
    constructor(private readonly userService: UserService) {}

    @Get('profile')
    @ApiEndpoint({ summary: 'Get user profile', serialization: UserGetProfileResponseDto, messageKey: 'user.success.profile' })
    getProfile(@AuthUser() user: IAuthUser): Promise<UserGetProfileResponseDto> {
        return this.userService.getProfile(user.userId);
    }

    @Put()
    @ApiEndpoint({ summary: 'Update user profile', serialization: UserUpdateProfileResponseDto, messageKey: 'user.success.updated' })
    updateUser(@AuthUser() user: IAuthUser, @Body() payload: UserUpdateDto): Promise<UserUpdateProfileResponseDto> {
        return this.userService.updateUser(user.userId, payload);
    }
}

// Admin controller
@ApiTags('admin.user')
@ApiBearerAuth('accessToken')
@AllowedRoles([UserRole.SOCIO])
@Controller({ path: '/admin/user', version: '1' })
export class UserAdminController {
    @Delete(':id')
    @ApiEndpoint({ summary: 'Delete user', messageKey: 'user.success.deleted' })
    deleteUser(@Param('id') userId: string): Promise<ApiGenericResponseDto> {
        return this.userService.deleteUser(userId);
    }
}
```

**`@ApiEndpoint` signature:**
```typescript
ApiEndpoint({ summary, serialization?, paginated?, messageKey, httpStatus? })
```
- Con `serialization`: envuelve en `ApiSuccessResponseDto<T>`
- Con `paginated: true` + `serialization`: envuelve en paginated envelope
- Sin `serialization`: usa `ApiGenericResponseDto`
- `httpStatus` default `HttpStatus.OK`; setear `HttpStatus.CREATED` para POST

## DTO Patterns

**Response DTOs** (`<name>.dto.ts`):
```typescript
export class UserResponseDto implements Omit<UserEntity, 'passwordHash'> {
    @ApiProperty({ example: faker.string.uuid() }) @Expose() @IsUUID() id: string;
    @ApiProperty({ example: faker.internet.email() }) @Expose() @IsEmail() email: string;
    @ApiProperty({ example: faker.person.firstName(), required: false, nullable: true })
    @Expose() @IsString() @IsOptional() firstName: string | null;
    @ApiProperty({ enum: UserRole, example: faker.helpers.arrayElement(Object.values(UserRole)) })
    @Expose() @IsEnum(UserRole) role: UserRole;

    @ApiHideProperty() @Exclude() passwordHash: string; // sensible: hide + exclude
}
```

- Todo campo incluido: `@Expose()` + `@ApiProperty({ example: faker.* })`
- Nullable optional: `required: false, nullable: true` en `@ApiProperty`
- Campos sensibles: `@ApiHideProperty()` + `@Exclude()`
- Variantes nombradas extienden la base — sin duplicar campos
- `ResponseInterceptor` usa `plainToInstance(SerializationClass, data, { excludeExtraneousValues: true })` — campos sin `@Expose()` son eliminados

**Input DTOs** (`<name>.update.dto.ts`):
```typescript
export class UserUpdateDto {
    @ApiProperty({ example: faker.internet.email(), required: false })
    @IsEmail() @IsOptional()
    @Transform(({ value }) => value?.toLowerCase().trim())
    email?: string;

    @ApiProperty({ example: faker.person.firstName(), required: false })
    @IsString() @IsOptional() @MinLength(2) @MaxLength(50)
    @Transform(({ value }) => value?.trim())
    firstName?: string;
}
```

- Cada campo: decorador(es) class-validator + `@ApiProperty`
- Update DTOs: `@IsOptional()` primero, luego validadores de tipo
- Sanitización de strings: `@Transform(({ value }) => value?.toLowerCase().trim())`
- `ValidationPipe` es global: `whitelist: true, forbidNonWhitelisted: true, transform: true`

## Response Envelope

Todas las respuestas siguen este shape (seteado por `ResponseInterceptor`):
```json
{ "statusCode": 200, "message": "User profile retrieved", "timestamp": "2026-01-01T00:00:00.000Z", "data": { ... } }
```

Error responses (desde `ResponseExceptionFilter`):
```json
{ "statusCode": 404, "message": "User not found", "timestamp": "2026-01-01T00:00:00.000Z" }
```

`ApiGenericResponseDto` (para operaciones de éxito booleano):
```json
{ "success": true, "message": "user.success.userDeleted" }
```

## i18n Keys

Archivos de idioma: `src/languages/en/<domain>.json`

Estructura:
```json
{
  "success": { "profile": "User profile retrieved", "updated": "User updated" },
  "error": { "userNotFound": "User not found", "userExists": "User already exists" }
}
```

- Services tiran: `'user.error.userNotFound'`, `'auth.error.invalidPassword'`
- Controller `messageKey`: `'user.success.profile'`, `'auth.success.loggedIn'`
- `MessageService` resuelve al momento de la respuesta — devuelve la key cruda si no existe

## Prisma Schema Conventions

```prisma
model Post {
  id        String    @id @default(uuid())
  title     String
  authorId  String    @map("author_id")
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  deletedAt DateTime? @map("deleted_at")

  author    User      @relation(fields: [authorId], references: [id])

  @@map("posts")
}
```

- PK: `id String @id @default(uuid())`
- Timestamps estándar en todo modelo: `createdAt`, `updatedAt @updatedAt`, `deletedAt?` — todos `@map("snake_case")`
- Nombres de campo: camelCase en schema, `@map("snake_case")` en todo campo no trivial
- Tabla: `@@map("plural_snake_case")`
- Enums: definir en schema, re-exportar desde `src/common/database/enums/<name>.enum.ts` como `export { Role as UserRole } from '@prisma/client'`
- Después de cualquier cambio: `npm run db:generate` y luego `npm run db:migrate`

## CacheService API

Inyectar via constructor: `constructor(private readonly cacheService: CacheService) {}`

```typescript
cacheService.get<T>(key)               // T | null; auto-JSON-deserializa
cacheService.set(key, value, ttlSec?)  // persistir o con TTL
cacheService.del(...keys)              // borrar una o más keys
cacheService.exists(key)               // boolean
cacheService.keys(pattern)             // glob match, evitar en datasets grandes
cacheService.hset(key, field, value)   // hash set
cacheService.hget<T>(key, field)       // T | null
cacheService.hgetall<T>(key)           // T | null
cacheService.hdel(key, ...fields)
cacheService.incr(key) / decr(key)    // contador atómico
cacheService.expire(key, ttlSec)
cacheService.ttl(key)                  // -1=sin expiry, -2=no existe
cacheService.flush()                   // flushdb — usar con cuidado
cacheService.isHealthy()               // boolean
cacheService.getClient()               // cliente ioredis crudo
```

## Cron Scheduler Pattern

```typescript
// src/workers/schedulers/midnight.scheduler.ts
@Injectable({ scope: Scope.DEFAULT })
export class MidNightScheduleWorker {
    private readonly logger = new Logger(MidNightScheduleWorker.name);

    @Cron('0 0 * * *')
    handleCron() {
        this.logger.log('Task to be run at 12 midnight');
    }
}
```

- Registrar en `src/workers/worker.module.ts` providers

## Testing

**NO escribir tests a menos que el usuario lo pida explícitamente.** El foco está en desarrollo de features, no en cobertura.

Cuando se pidan tests, seguir estos patrones:

### Patterns

```typescript
// test/modules/user.service.spec.ts
const mockUserRepository = {
    findById: jest.fn(),
    existsById: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
};

describe('UserService', () => {
    let service: UserService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserService,
                { provide: UserRepository, useValue: mockUserRepository },
            ],
        }).compile();
        service = module.get(UserService);
    });

    it('should be defined', () => expect(service).toBeDefined());

    describe('getProfile', () => {
        it('returns user when found', async () => {
            mockUserRepository.findById.mockResolvedValue({ id: '1', email: 'a@b.com' });
            await expect(service.getProfile('1')).resolves.toEqual({ id: '1', email: 'a@b.com' });
        });

        it('throws NOT_FOUND when user is missing', async () => {
            mockUserRepository.findById.mockResolvedValue(null);
            await expect(service.getProfile('1')).rejects.toThrow(HttpException);
        });
    });
});
```

Reglas:
- Mock deps como objetos planos `{ method: jest.fn() }` — nunca `jest.createMockFromModule`
- **Nunca** llamar `jest.clearAllMocks()` en `beforeEach` — `clearMocks: true` es global en `test/jest.json`
- `@faker-js/faker` tiene alias en `test/mocks/faker.mock.ts` — valores determinísticos
- Usar alias `src/` en imports — nunca paths relativos `../../`
- Ubicación de tests: `test/` espeja `src/` (ej. `test/modules/user.service.spec.ts`)
- Estructura: `describe('ClassName') > describe('method') > it('should...')`
- Assertions: `resolves.toEqual(...)`, `rejects.toThrow(HttpException)`, `toHaveBeenCalledWith(...)`
- Todo método público: happy path + error/guard throw + propagación de dependencias
- Coverage de: `*.service.ts`, `*.guard.ts`, `*.filter.ts`, `*.interceptor.ts`, `*.repository.ts`

## File Naming

Patrón: `<feature>.<type>.ts`. El punto delimita el tipo. Kebab dentro de segmentos.

| Feature-prefixed | Bare name |
|---|---|
| `auth.module.ts`, `user.service.ts` | `jwt-access.guard.ts`, `roles.guard.ts` |
| `auth.public.controller.ts`, `user.admin.controller.ts` | `public.decorator.ts`, `auth-user.decorator.ts` |
| `auth.login.dto.ts`, `user.update.dto.ts` | `jwt-access.strategy.ts`, `midnight.scheduler.ts` |
| `response.interceptor.ts`, `response.exception.filter.ts` | `health.controller.ts` |
| `cache.constant.ts`, `app.config.ts`, `request.interface.ts` | |

## Environment Variables

Requeridas: `DATABASE_URL`, `REDIS_URL`, `AUTH_ACCESS_TOKEN_SECRET`, `AUTH_REFRESH_TOKEN_SECRET`

Opcionales: `APP_ENV` (local/development/staging/production), `APP_NAME`, `APP_PORT`, `HTTP_HOST`, `AUTH_ACCESS_TOKEN_EXP`, `AUTH_REFRESH_TOKEN_EXP`, `SENTRY_DSN`, `APP_CORS_ORIGINS`, `APP_DEBUG`

Generar secrets: `openssl rand -base64 32`

## Docker

- `docker-compose.yml` — dev stage: source montado en `/app`, node_modules fijado via anonymous volume
- `docker-entrypoint.sh` — ejecuta `db:generate` + `db:migrate-prod` antes de iniciar la app
- Producción: `docker build --target production` (no via Compose)
- `HTTP_HOST` debe ser `0.0.0.0` dentro de Docker

## Commit Convention

```
feat | fix | docs | style | refactor | perf | test | build | ci | chore | revert
```
Ejemplo: `feat(auth): add email verification flow`

## Reglas para el Agente IA (opencode)

1. **Leer este archivo entero** antes de generar código en el backend
2. **Seguir los patrones existentes exactamente** — si `UserModule` usa controller split (public + admin), TODO feature nuevo también
3. **Nunca modificar `src/common/`** sin revisar el impacto en cascada
4. **Nunca importar `CommonModule` en feature modules** — usar `DatabaseModule`
5. **Nunca usar `process.env` en services/controllers** — usar `ConfigService.getOrThrow`
6. **Siempre usar `@Expose()` en DTO fields** o `ResponseInterceptor` los elimina
7. **Siempre usar `@PublicRoute()` en endpoints de auth** o `JwtAccessGuard` los bloquea
8. **`@AllowedRoles()` siempre recibe array**: `@AllowedRoles([UserRole.SOCIO])`, nunca sin `[]`
9. **Nuevos repositorios**: wirearlos en `database.module.ts` (providers + exports)
10. **Nuevos módulos**: importarlos en `app.module.ts`
11. **Antes de crear un feature**: leer el exploration.md y design.md en `.atl/changes/` si existe
12. **Testing**: NO escribir tests a menos que el usuario lo pida explícitamente. Cuando se pidan: 100% coverage, tests en `test/` espejando `src/`

## Errores Comunes (Pitfalls)

1. Olvidar `@PublicRoute()` en rutas auth/health — `JwtAccessGuard` las bloquea
2. Editar `schema.prisma` sin correr `npm run db:generate`
3. Leer `process.env` en services — usar `ConfigService.getOrThrow`
4. Retornar datos de controller sin `@Expose()` en DTO fields — `ResponseInterceptor` los elimina
5. `@AllowedRoles(UserRole.SOCIO)` sin array — `RolesGuard` espera `UserRole[]`
6. Agregar campo non-nullable en Prisma sin default — `db:generate` pasa pero `tsc` falla
7. Llamar `jest.clearAllMocks()` en `beforeEach` — redundante con `clearMocks: true` global
8. Retornar entidad Prisma cruda con `passwordHash` — `@Exclude()` en DTO lo previene, no saltearlo
9. Importar `CommonModule` en un feature module — es solo para `AppModule`; importar `DatabaseModule` directamente
