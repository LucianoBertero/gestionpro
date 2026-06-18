import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

/* ---------- Response DTO ---------- */
export class ClaveResponseDto {
    @ApiProperty({ example: 'uuid-1234' })
    @Expose()
    id: string;

    @ApiProperty({ example: 'AFIP' })
    @Expose()
    entidad: string;

    @ApiProperty({ example: 'MiClave123' })
    @Expose()
    clave: string;

    @ApiProperty({ example: 'uuid-user' })
    @Expose()
    creadoPorId: string;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    @Expose()
    creadoEn: Date;
}

/* ---------- Create DTO ---------- */
export class CreateClaveDto {
    @ApiProperty({ example: 'AFIP' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(100)
    entidad: string;

    @ApiProperty({ example: 'MiClaveSegura123' })
    @IsString()
    @IsNotEmpty()
    @MinLength(1)
    @MaxLength(500)
    clave: string;
}

/* ---------- Update DTO ---------- */
export class UpdateClaveDto {
    @ApiProperty({ example: 'AFIP', required: false })
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(100)
    entidad?: string;

    @ApiProperty({ example: 'NuevaClaveSegura456', required: false })
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(500)
    clave?: string;
}
