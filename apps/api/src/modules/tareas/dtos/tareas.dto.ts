import { faker } from '@faker-js/faker';
import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import { EstadoTarea } from 'src/common/database/enums/estado-tarea.enum';
import { Prioridad } from 'src/common/database/enums/prioridad.enum';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';
import { TipoTarea } from 'src/common/database/enums/tipo-tarea.enum';

// ─── Embedded DTOs ────────────────────────────────────────────────────────────

export class TareaClienteMinDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ example: faker.company.name() })
    @Expose()
    @IsString()
    denominacion: string;
}

export class TareaEncargadoMinDto {
    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    id: string;

    @ApiProperty({ example: faker.person.fullName() })
    @Expose()
    @IsString()
    nombre: string;
}

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class TareaResponseDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ example: 1 })
    @Expose()
    @IsInt()
    estudioId: number;

    @ApiProperty({ example: 1, required: false, nullable: true })
    @Expose()
    @IsInt()
    @IsOptional()
    clienteId: number | null;

    @ApiProperty({ example: faker.string.uuid() })
    @Expose()
    @IsUUID()
    encargadoId: string;

    @ApiProperty({ example: faker.lorem.sentence(4) })
    @Expose()
    @IsString()
    titulo: string;

    @ApiProperty({ example: faker.lorem.paragraph(), required: false, nullable: true })
    @Expose()
    @IsString()
    @IsOptional()
    descripcion: string | null;

    @ApiProperty({ enum: TipoTarea, example: faker.helpers.arrayElement(Object.values(TipoTarea)) })
    @Expose()
    @IsEnum(TipoTarea)
    tipo: TipoTarea;

    @ApiProperty({ enum: TipoImpuesto, required: false, nullable: true })
    @Expose()
    @IsEnum(TipoImpuesto)
    @IsOptional()
    impuesto: TipoImpuesto | null;

    @ApiProperty({ example: '2026-05', required: false, nullable: true })
    @Expose()
    @IsString()
    @IsOptional()
    periodo: string | null;

    @ApiProperty({ example: 30, required: false, nullable: true })
    @Expose()
    @IsInt()
    @IsOptional()
    tiempoEstMin: number | null;

    @ApiProperty({ enum: Prioridad, example: Prioridad.MEDIA })
    @Expose()
    @IsEnum(Prioridad)
    prioridad: Prioridad;

    @ApiProperty({ enum: EstadoTarea, example: EstadoTarea.PENDIENTE })
    @Expose()
    @IsEnum(EstadoTarea)
    estado: EstadoTarea;

    @ApiProperty({ example: faker.date.future().toISOString(), required: false, nullable: true })
    @Expose()
    @IsDate()
    @IsOptional()
    vence: Date | null;

    @ApiProperty({ example: false })
    @Expose()
    @IsBoolean()
    esRecurrente: boolean;

    @ApiProperty({ example: null, required: false, nullable: true })
    @Expose()
    @IsOptional()
    reglaRecur: Record<string, unknown> | null;

    @ApiProperty({ example: faker.lorem.sentence(), required: false, nullable: true })
    @Expose()
    @IsString()
    @IsOptional()
    notas: string | null;

    @ApiProperty({ example: true })
    @Expose()
    @IsBoolean()
    activo: boolean;

    @ApiProperty({ example: faker.date.past().toISOString() })
    @Expose()
    @IsDate()
    creadoEn: Date;

    @ApiProperty({ example: faker.date.recent().toISOString() })
    @Expose()
    @IsDate()
    actualizadoEn: Date;

    @ApiProperty({ type: TareaClienteMinDto, required: false, nullable: true })
    @Expose()
    @ValidateNested()
    @Type(() => TareaClienteMinDto)
    @IsOptional()
    cliente: TareaClienteMinDto | null;

    @ApiProperty({ type: TareaEncargadoMinDto })
    @Expose()
    @ValidateNested()
    @Type(() => TareaEncargadoMinDto)
    encargado: TareaEncargadoMinDto;
}

// ─── Create DTO ──────────────────────────────────────────────────────────────

export class CreateTareaDto {
    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    clienteId?: number;

    @ApiProperty({ example: faker.string.uuid() })
    @IsUUID()
    encargadoId: string;

    @ApiProperty({ example: 'Presentar DDJJ IVA Mayo' })
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    titulo: string;

    @ApiProperty({ example: faker.lorem.paragraph(), required: false })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiProperty({ enum: TipoTarea, example: TipoTarea.DDJJ })
    @IsEnum(TipoTarea)
    tipo: TipoTarea;

    @ApiProperty({ enum: TipoImpuesto, required: false })
    @IsEnum(TipoImpuesto)
    @IsOptional()
    impuesto?: TipoImpuesto;

    @ApiProperty({ example: '2026-05', required: false })
    @IsString()
    @IsOptional()
    periodo?: string;

    @ApiProperty({ example: 60, required: false })
    @IsInt()
    @IsOptional()
    tiempoEstMin?: number;

    @ApiProperty({ enum: Prioridad, example: Prioridad.MEDIA, required: false })
    @IsEnum(Prioridad)
    @IsOptional()
    prioridad?: Prioridad;

    @ApiProperty({ example: faker.date.future().toISOString(), required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    vence?: Date;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    esRecurrente?: boolean;

    @ApiProperty({ example: null, required: false })
    @IsOptional()
    reglaRecur?: Record<string, unknown>;

    @ApiProperty({ example: faker.lorem.sentence(), required: false })
    @IsString()
    @IsOptional()
    notas?: string;
}

// ─── Update DTO ──────────────────────────────────────────────────────────────

export class UpdateTareaDto {
    @ApiProperty({ example: 1, required: false })
    @IsInt()
    @IsOptional()
    clienteId?: number;

    @ApiProperty({ example: faker.string.uuid(), required: false })
    @IsUUID()
    @IsOptional()
    encargadoId?: string;

    @ApiProperty({ example: 'Presentar DDJJ IVA Mayo', required: false })
    @IsString()
    @IsOptional()
    @MinLength(3)
    @MaxLength(200)
    titulo?: string;

    @ApiProperty({ example: faker.lorem.paragraph(), required: false })
    @IsString()
    @IsOptional()
    descripcion?: string;

    @ApiProperty({ enum: TipoTarea, required: false })
    @IsEnum(TipoTarea)
    @IsOptional()
    tipo?: TipoTarea;

    @ApiProperty({ enum: TipoImpuesto, required: false })
    @IsEnum(TipoImpuesto)
    @IsOptional()
    impuesto?: TipoImpuesto;

    @ApiProperty({ example: '2026-05', required: false })
    @IsString()
    @IsOptional()
    periodo?: string;

    @ApiProperty({ example: 60, required: false })
    @IsInt()
    @IsOptional()
    tiempoEstMin?: number;

    @ApiProperty({ enum: Prioridad, required: false })
    @IsEnum(Prioridad)
    @IsOptional()
    prioridad?: Prioridad;

    @ApiProperty({ enum: EstadoTarea, required: false })
    @IsEnum(EstadoTarea)
    @IsOptional()
    estado?: EstadoTarea;

    @ApiProperty({ example: faker.date.future().toISOString(), required: false })
    @IsDate()
    @Type(() => Date)
    @IsOptional()
    vence?: Date;

    @ApiProperty({ example: false, required: false })
    @IsBoolean()
    @IsOptional()
    esRecurrente?: boolean;

    @ApiProperty({ example: null, required: false })
    @IsOptional()
    reglaRecur?: Record<string, unknown>;

    @ApiProperty({ example: faker.lorem.sentence(), required: false })
    @IsString()
    @IsOptional()
    notas?: string;
}
