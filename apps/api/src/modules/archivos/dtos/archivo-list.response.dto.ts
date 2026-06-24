import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, IsObject, IsOptional, IsString } from 'class-validator';
import { ArchivoResponseDto } from './archivo.response.dto';

export class ArchivoParentInfoDto {
    @ApiProperty({ enum: ['cliente', 'tarea', 'liquidacion', 'estudio'] })
    @Expose()
    @IsString()
    type: string;

    @ApiPropertyOptional({ example: 42 })
    @Expose()
    @IsInt()
    @IsOptional()
    id?: number;

    @ApiPropertyOptional({ example: 'Acme SA' })
    @Expose()
    @IsString()
    @IsOptional()
    name?: string;
}

export class ArchivoWithParentResponseDto extends ArchivoResponseDto {
    @ApiPropertyOptional({ type: ArchivoParentInfoDto })
    @Expose()
    @IsObject()
    @IsOptional()
    parent?: ArchivoParentInfoDto;
}
