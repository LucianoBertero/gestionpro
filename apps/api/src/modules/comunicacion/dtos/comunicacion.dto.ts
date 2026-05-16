import { ApiProperty, ApiHideProperty } from '@nestjs/swagger';
import { Expose, Exclude } from 'class-transformer';
import { IsString, IsOptional, IsInt, MinLength, MaxLength } from 'class-validator';

export class ComunicacionResponseDto {
    @ApiProperty({ example: 1 })
    @Expose() id: number;

    @ApiProperty({ example: 1 })
    @Expose() clienteId: number;

    @ApiProperty({ example: 'uuid' })
    @Expose() usuarioId: string;

    @ApiProperty({ example: 'EMAIL' })
    @Expose() tipo: string;

    @ApiProperty({ example: 'Recordatorio de vencimiento', required: false, nullable: true })
    @Expose() asunto: string | null;

    @ApiProperty({ example: 'Contenido de la comunicación...', required: false, nullable: true })
    @Expose() contenido: string | null;

    @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
    @Expose() creadoEn: Date;

    @ApiProperty({ example: { id: 'uuid', nombre: 'Juan Pérez' }, required: false })
    @Expose() usuario?: { id: string; nombre: string };
}

export class CreateComunicacionDto {
    @ApiProperty({ example: 1 })
    @IsInt()
    clienteId: number;

    @ApiProperty({ example: 'EMAIL' })
    @IsString()
    @MinLength(1)
    @MaxLength(50)
    tipo: string;

    @ApiProperty({ example: 'Recordatorio de vencimiento', required: false, nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    asunto?: string;

    @ApiProperty({ example: 'Contenido de la comunicación...', required: false, nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    contenido?: string;
}

export class UpdateComunicacionDto {
    @ApiProperty({ example: 'EMAIL', required: false })
    @IsString()
    @IsOptional()
    @MaxLength(50)
    tipo?: string;

    @ApiProperty({ example: 'Recordatorio actualizado', required: false, nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(200)
    asunto?: string;

    @ApiProperty({ example: 'Contenido actualizado...', required: false, nullable: true })
    @IsString()
    @IsOptional()
    @MaxLength(5000)
    contenido?: string;
}
