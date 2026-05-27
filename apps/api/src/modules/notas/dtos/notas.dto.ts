import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class NotaCreadorDto {
    @ApiProperty({ example: faker.string.uuid() })
    @Expose() id: string;

    @ApiProperty({ example: faker.person.fullName() })
    @Expose() nombre: string;

    @ApiProperty({ example: '👤', required: false, nullable: true })
    @Expose() emoji: string | null;
}

export class NotaClienteResponseDto {
    @ApiProperty({ example: 1 })
    @Expose() id: number;

    @ApiProperty({ example: 1 })
    @Expose() clienteId: number;

    @ApiProperty({ example: 'Contenido de la nota...' })
    @Expose() contenido: string;

    @ApiProperty({ example: faker.string.uuid() })
    @Expose() creadoPorId: string;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    @Expose() creadoEn: Date;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    @Expose() actualizadoEn: Date;

    @ApiProperty({ type: NotaCreadorDto })
    @Expose() creadoPor: NotaCreadorDto;
}

export class CreateNotaDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    clienteId: number;

    @ApiProperty({ example: 'Contenido de la nota...' })
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    contenido: string;
}

export class UpdateNotaDto {
    @ApiProperty({ example: 'Contenido actualizado...' })
    @IsString()
    @MinLength(1)
    @MaxLength(5000)
    contenido: string;
}
