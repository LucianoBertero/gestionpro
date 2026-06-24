import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsDateString, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { faker } from '@faker-js/faker';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

export class CreateVencimientoDto {
    @ApiProperty({ enum: TipoImpuesto, example: faker.helpers.arrayElement(Object.values(TipoImpuesto)) })
    @IsEnum(TipoImpuesto)
    impuesto: TipoImpuesto;

    @ApiProperty({ example: 2026 })
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    anio: number;

    @ApiProperty({ example: 6 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(12)
    mes: number;

    @ApiProperty({ example: 3 })
    @Type(() => Number)
    @IsInt()
    @Min(0)
    @Max(9)
    digitoCuit: number;

    @ApiProperty({ example: '2026-06-22' })
    @IsDateString()
    fechaVence: string;
}

export class CreateVencimientoBatchDto {
    @ApiProperty({ type: [CreateVencimientoDto] })
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateVencimientoDto)
    rows: CreateVencimientoDto[];
}

export class DuplicateYearDto {
    @ApiProperty({ example: 2025 })
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    sourceYear: number;

    @ApiProperty({ example: 2026 })
    @Type(() => Number)
    @IsInt()
    @Min(2000)
    @Max(2100)
    targetYear: number;
}
