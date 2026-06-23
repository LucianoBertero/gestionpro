import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

import { TipoArchivo } from 'src/common/database/enums/tipo-archivo.enum';

export class ArchivoResponseDto {
    @ApiProperty({ example: 1 })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({ example: 'estudios/1/clientes/42/2026-06/abc123.pdf' })
    @Expose()
    @IsString()
    storageKey: string;

    @ApiProperty({ example: 'application/pdf' })
    @Expose()
    @IsString()
    mimeType: string;

    @ApiProperty({ example: 'pdf' })
    @Expose()
    @IsString()
    extension: string;

    @ApiProperty({ example: 51200 })
    @Expose()
    @IsInt()
    @Min(0)
    bytes: number;

    @ApiProperty({ example: 'declaracion-iva-2026-05.pdf' })
    @Expose()
    @IsString()
    originalName: string;

    @ApiProperty({ enum: TipoArchivo, example: 'DDJJ' })
    @Expose()
    @IsEnum(TipoArchivo)
    tipo: TipoArchivo;

    @ApiPropertyOptional({ example: '2026-05', nullable: true })
    @Expose()
    @IsString()
    @IsOptional()
    periodo: string | null;

    @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
    @Expose()
    @IsUUID()
    subidoPorId: string;

    @ApiProperty({ example: true })
    @Expose()
    @IsBoolean()
    activo: boolean;

    @ApiProperty({ example: '2026-06-15T10:30:00.000Z' })
    @Expose()
    @IsDate()
    creadoEn: Date;

    @ApiProperty({ example: 'https://signed-url.example.com/read?token=abc' })
    @Expose()
    @IsString()
    signedUrl: string;
}
