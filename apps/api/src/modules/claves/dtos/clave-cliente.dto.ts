import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength } from 'class-validator';

export class ClaveClienteResponseDto {
    @ApiProperty() @Expose() id: string;
    @ApiProperty() @Expose() clienteId: number;
    @ApiProperty() @Expose() entidad: string;
    @ApiProperty() @Expose() clave: string;
    @ApiProperty() @Expose() creadoPorId: string;
    @ApiProperty() @Expose() creadoEn: Date;
}

export class CreateClaveClienteDto {
    @ApiProperty({ example: 'AFIP' })
    @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(100)
    entidad: string;

    @ApiProperty({ example: 'ClaveFiscalCliente123' })
    @IsString() @IsNotEmpty() @MinLength(1) @MaxLength(500)
    clave: string;
}

export class UpdateClaveClienteDto {
    @ApiProperty({ example: 'AFIP', required: false })
    @IsString() @IsOptional() @MinLength(1) @MaxLength(100)
    entidad?: string;

    @ApiProperty({ example: 'NuevaClave456', required: false })
    @IsString() @IsOptional() @MinLength(1) @MaxLength(500)
    clave?: string;
}
