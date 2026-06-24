import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsOptional, IsDateString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

export class VencimientoListFiltersDto {
    @ApiProperty({ enum: TipoImpuesto, required: false, description: 'Filter by tax type' })
    @IsOptional()
    @IsEnum(TipoImpuesto)
    impuesto?: TipoImpuesto;

    @ApiProperty({ required: false, example: 2026, description: 'Filter by year' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    anio?: number;

    @ApiProperty({ required: false, example: 6, description: 'Filter by month (1-12)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mes?: number;

    @ApiProperty({ required: false, description: 'Filter from date (ISO string)', example: '2026-06-24' })
    @IsOptional()
    @IsDateString()
    dateFrom?: string;

    @ApiProperty({ required: false, description: 'Filter to date (ISO string)', example: '2026-07-24' })
    @IsOptional()
    @IsDateString()
    dateTo?: string;

    @ApiProperty({ required: false, default: 1, description: 'Page number' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiProperty({ required: false, default: 50, description: 'Items per page (max 200)' })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(200)
    limit?: number = 50;
}
