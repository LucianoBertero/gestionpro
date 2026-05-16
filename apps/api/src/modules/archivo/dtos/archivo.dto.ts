import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsEnum, MinLength, MaxLength, Min } from 'class-validator';
import { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';

export class ArchivoResponseDto {
    @ApiProperty({ example: 1 })
    @Expose() id: number;

    @ApiProperty({ example: 1 })
    @Expose() clienteId: number;

    @ApiProperty({ example: 'comprobante-iva-2026-01.pdf' })
    @Expose() nombre: string;

    @ApiProperty({ enum: TipoArchivo })
    @Expose() tipo: TipoArchivo;

    @ApiProperty({ example: '2026-01', required: false, nullable: true })
    @Expose() periodo: string | null;

    @ApiProperty({ example: 'https://cdn.example.com/archivo.pdf' })
    @Expose() url: string;

    @ApiProperty({ example: 1024, required: false, nullable: true })
    @Expose() tamanioKb: number | null;

    @ApiProperty({ example: 'uuid' })
    @Expose() subidoPorId: string;

    @ApiProperty({ example: true })
    @Expose() activo: boolean;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    @Expose() creadoEn: Date;

    @ApiProperty({ example: { id: 'uuid', nombre: 'Juan Pérez' }, required: false })
    @Expose() subidoPor?: { id: string; nombre: string };
}

export class CreateArchivoDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    clienteId: number;

    @ApiProperty({ example: 'comprobante-iva-2026-01.pdf' })
    @IsString()
    @MinLength(1)
    @MaxLength(255)
    nombre: string;

    @ApiProperty({ enum: TipoArchivo })
    @IsEnum(TipoArchivo)
    tipo: TipoArchivo;

    @ApiProperty({ example: '2026-01', required: false, nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(10)
    periodo?: string;

    @ApiProperty({ example: 'https://cdn.example.com/archivo.pdf' })
    @IsString()
    url: string;

    @ApiProperty({ example: 1024, required: false, nullable: true })
    @IsInt()
    @IsOptional()
    @Min(0)
    tamanioKb?: number;
}

export class UpdateArchivoDto {
    @ApiProperty({ example: 'comprobante-actualizado.pdf', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(255)
    nombre?: string;

    @ApiProperty({ enum: TipoArchivo, required: false })
    @IsEnum(TipoArchivo)
    @IsOptional()
    tipo?: TipoArchivo;

    @ApiProperty({ example: '2026-02', required: false, nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(10)
    periodo?: string;
}
