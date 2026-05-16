import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Type } from 'class-transformer';
import {
    IsBoolean,
    IsDate,
    IsDecimal,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
    ValidateNested,
} from 'class-validator';

import { ResultadoLiq } from 'src/common/database/enums/resultado-liq.enum';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

// ─── Embedded ─────────────────────────────────────────────────────────────────

export class LiquidacionClienteMinDto {
    @ApiProperty({ example: 1 }) @Expose() @IsInt() id: number;
    @ApiProperty({ example: faker.company.name() }) @Expose() @IsString() denominacion: string;
}

export class LiquidacionUsuarioMinDto {
    @ApiProperty({ example: faker.string.uuid() }) @Expose() @IsUUID() id: string;
    @ApiProperty({ example: faker.person.fullName() }) @Expose() @IsString() nombre: string;
}

// ─── Response ─────────────────────────────────────────────────────────────────

export class LiquidacionResponseDto {
    @ApiProperty({ example: 1 }) @Expose() @IsInt() id: number;
    @ApiProperty({ example: 1 }) @Expose() @IsInt() estudioId: number;
    @ApiProperty({ example: 1 }) @Expose() @IsInt() clienteId: number;
    @ApiProperty({ enum: TipoImpuesto }) @Expose() @IsEnum(TipoImpuesto) impuesto: TipoImpuesto;
    @ApiProperty({ example: '2026-05' }) @Expose() @IsString() periodo: string;
    @ApiProperty({ enum: ResultadoLiq }) @Expose() @IsEnum(ResultadoLiq) resultado: ResultadoLiq;
    @ApiProperty({ example: 45230.50, required: false, nullable: true }) @Expose() @IsOptional() importe: number | null;
    @ApiProperty({ example: 42100.00, required: false, nullable: true }) @Expose() @IsOptional() importeRef: number | null;
    @ApiProperty({ example: faker.date.future().toISOString(), required: false, nullable: true }) @Expose() @IsDate() @IsOptional() vencimiento: Date | null;
    @ApiProperty({ example: 'VEP', required: false, nullable: true }) @Expose() @IsString() @IsOptional() formaPago: string | null;
    @ApiProperty({ example: null, required: false, nullable: true }) @Expose() @IsString() @IsOptional() comprobante: string | null;
    @ApiProperty({ example: faker.string.uuid() }) @Expose() @IsUUID() cargadoPorId: string;
    @ApiProperty({ example: 'MANUAL' }) @Expose() @IsString() origenCarga: string;
    @ApiProperty({ example: true }) @Expose() @IsBoolean() activo: boolean;
    @ApiProperty({ example: faker.date.past().toISOString() }) @Expose() @IsDate() creadoEn: Date;
    @ApiProperty({ type: LiquidacionClienteMinDto, required: false, nullable: true }) @Expose() @ValidateNested() @Type(() => LiquidacionClienteMinDto) @IsOptional() cliente: LiquidacionClienteMinDto | null;
    @ApiProperty({ type: LiquidacionUsuarioMinDto, required: false, nullable: true }) @Expose() @ValidateNested() @Type(() => LiquidacionUsuarioMinDto) @IsOptional() cargadoPor: LiquidacionUsuarioMinDto | null;
}

// ─── Create DTO ──────────────────────────────────────────────────────────────

export class CreateLiquidacionDto {
    @ApiProperty({ example: 1 }) @IsInt() clienteId: number;
    @ApiProperty({ enum: TipoImpuesto }) @IsEnum(TipoImpuesto) impuesto: TipoImpuesto;
    @ApiProperty({ example: '2026-05' }) @IsString() @MinLength(7) @MaxLength(7) periodo: string;
    @ApiProperty({ enum: ResultadoLiq }) @IsEnum(ResultadoLiq) resultado: ResultadoLiq;
    @ApiProperty({ example: 45230.50, required: false }) @IsOptional() importe?: number;
    @ApiProperty({ example: faker.date.future().toISOString(), required: false }) @IsDate() @Type(() => Date) @IsOptional() vencimiento?: Date;
    @ApiProperty({ example: 'VEP', required: false }) @IsString() @IsOptional() formaPago?: string;
}

// ─── Update DTO ──────────────────────────────────────────────────────────────

export class UpdateLiquidacionDto {
    @ApiProperty({ enum: TipoImpuesto, required: false }) @IsEnum(TipoImpuesto) @IsOptional() impuesto?: TipoImpuesto;
    @ApiProperty({ example: '2026-05', required: false }) @IsString() @IsOptional() @MinLength(7) @MaxLength(7) periodo?: string;
    @ApiProperty({ enum: ResultadoLiq, required: false }) @IsEnum(ResultadoLiq) @IsOptional() resultado?: ResultadoLiq;
    @ApiProperty({ example: 45230.50, required: false }) @IsOptional() importe?: number;
    @ApiProperty({ example: faker.date.future().toISOString(), required: false }) @IsDate() @Type(() => Date) @IsOptional() vencimiento?: Date;
    @ApiProperty({ example: 'VEP', required: false }) @IsString() @IsOptional() formaPago?: string;
}
