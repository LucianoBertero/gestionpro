import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsEnum, IsInt, IsString, ValidateNested } from 'class-validator';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

export class VencimientoClienteDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ example: faker.company.name() })
    @Expose()
    @IsString()
    denominacion: string;

    @ApiProperty({ example: '30-12345678-9' })
    @Expose()
    @IsString()
    cuit: string;
}

export class VencimientoConClientesDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ enum: TipoImpuesto, example: faker.helpers.arrayElement(Object.values(TipoImpuesto)) })
    @Expose()
    @IsEnum(TipoImpuesto)
    impuesto: TipoImpuesto;

    @ApiProperty({ example: 2026 })
    @Expose()
    @IsInt()
    anio: number;

    @ApiProperty({ example: 6 })
    @Expose()
    @IsInt()
    mes: number;

    @ApiProperty({ example: 3 })
    @Expose()
    @IsInt()
    digitoCuit: number;

    @ApiProperty({ example: '2026-06-22T00:00:00.000Z' })
    @Expose()
    @IsDate()
    fechaVence: Date;

    @ApiProperty({ type: [VencimientoClienteDto], description: 'Affected clients' })
    @Expose()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => VencimientoClienteDto)
    clientes: VencimientoClienteDto[];
}
