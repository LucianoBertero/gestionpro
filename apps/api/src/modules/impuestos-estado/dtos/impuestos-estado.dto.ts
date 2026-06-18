import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

import { ResultadoLiq } from 'src/common/database/enums/resultado-liq.enum';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

// ─── Estados derivados (no se persisten, se computan on-the-fly) ───────────

export enum EstadoImpuestoActual {
    A_PRESENTAR = 'A_PRESENTAR',
    PRESENTADO = 'PRESENTADO',
    VENCIDO = 'VENCIDO',
}

// ─── Liquidación embebida (solo lo necesario para el estado actual) ─────────

export class LiquidacionEstadoMinDto {
    @ApiProperty({ example: 42 }) @Expose() @IsInt() id: number;
    @ApiProperty({ example: '2026-06' }) @Expose() @IsString() periodo: string;
    @ApiProperty({ enum: ResultadoLiq }) @Expose() @IsEnum(ResultadoLiq) resultado: ResultadoLiq;
    @ApiProperty({ example: faker.date.recent().toISOString(), required: false, nullable: true })
    @Expose() @IsDate() @IsOptional() vencimiento: Date | null;
    @ApiProperty({ example: faker.date.recent().toISOString() }) @Expose() @IsDate() creadoEn: Date;
}

// ─── Response principal ─────────────────────────────────────────────────────

export class ImpuestoConEstadoResponseDto {
    @ApiProperty({ example: 1 }) @Expose() @IsInt() clienteImpuestoId: number;
    @ApiProperty({ example: 1 }) @Expose() @IsInt() clienteId: number;
    @ApiProperty({ enum: TipoImpuesto }) @Expose() @IsEnum(TipoImpuesto) tipo: TipoImpuesto;
    @ApiProperty({ example: true }) @Expose() @IsOptional() activo: boolean;
    @ApiProperty({ example: '2026-06' }) @Expose() @IsString() periodoActual: string;
    @ApiProperty({ enum: EstadoImpuestoActual }) @Expose() @IsEnum(EstadoImpuestoActual) estado: EstadoImpuestoActual;
    @ApiProperty({
        example: faker.date.future().toISOString(),
        required: false,
        nullable: true,
        description: 'Próximo vencimiento según CalendarioVencimiento (null si no hay fecha configurada)',
    })
    @Expose() @IsDate() @IsOptional() proximoVencimiento: Date | null;
    @ApiProperty({ type: LiquidacionEstadoMinDto, required: false, nullable: true })
    @Expose() @ValidateNested() @Type(() => LiquidacionEstadoMinDto) @IsOptional()
    liquidacionActual: LiquidacionEstadoMinDto | null;
}
