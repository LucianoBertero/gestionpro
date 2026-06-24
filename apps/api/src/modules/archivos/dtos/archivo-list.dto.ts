import { IsEnum, IsISO8601, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';

const PARENT_TYPE_VALUES = ['all', 'cliente', 'tarea', 'liquidacion', 'estudio'] as const;
export type ParentTypeFilter = (typeof PARENT_TYPE_VALUES)[number];

export class ArchivoListDto {
    @ApiPropertyOptional({ description: 'Search by filename (case-insensitive contains)', maxLength: 200 })
    @IsOptional()
    @IsString()
    @MaxLength(200)
    @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
    search?: string;

    @ApiPropertyOptional({ enum: TipoArchivo, description: 'Filter by file type' })
    @IsOptional()
    @IsEnum(TipoArchivo)
    tipo?: TipoArchivo;

    @ApiPropertyOptional({ enum: PARENT_TYPE_VALUES, description: 'Filter by parent type', default: 'all' })
    @IsOptional()
    @IsString()
    parentType?: string;

    @ApiPropertyOptional({ description: 'ISO 8601 date — filter files created on or after this date' })
    @IsOptional()
    @IsISO8601()
    dateFrom?: string;

    @ApiPropertyOptional({ description: 'ISO 8601 date — filter files created on or before this date' })
    @IsOptional()
    @IsISO8601()
    dateTo?: string;

    @ApiPropertyOptional({ description: 'Page number (1-based)', default: 1, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ description: 'Items per page', default: 20, minimum: 1, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(1)
    @Max(100)
    limit?: number;
}
