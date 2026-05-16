import { faker } from '@faker-js/faker';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';
import {
    IsArray,
    IsBoolean,
    IsDate,
    IsEmail,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    MaxLength,
    MinLength,
} from 'class-validator';

import { EstadoSemaforo } from 'src/common/database/enums/estado-semaforo.enum';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

// ─── Response DTOs ────────────────────────────────────────────────────────────

export class ClienteImpuestoDto {
    @ApiProperty({
        example: 1,
    })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({
        enum: TipoImpuesto,
        example: faker.helpers.arrayElement(Object.values(TipoImpuesto)),
    })
    @Expose()
    @IsEnum(TipoImpuesto)
    tipo: TipoImpuesto;

    @ApiProperty({
        example: true,
    })
    @Expose()
    @IsBoolean()
    activo: boolean;
}

export class ClienteResponseDto {
    @ApiProperty({
        example: 1,
    })
    @Expose()
    @IsInt()
    id: number;

    @ApiProperty({
        example: 1,
    })
    @Expose()
    @IsInt()
    estudioId: number;

    @ApiProperty({
        example: '30-12345678-9',
    })
    @Expose()
    @IsString()
    cuit: string;

    @ApiProperty({
        example: faker.company.name(),
    })
    @Expose()
    @IsString()
    denominacion: string;

    @ApiProperty({
        example: 0,
    })
    @Expose()
    @IsInt()
    termino: number;

    @ApiProperty({
        example: 'Responsable Inscripto',
    })
    @Expose()
    @IsString()
    condicionIva: string;

    @ApiProperty({
        example: ['Ventas al por mayor'],
    })
    @Expose()
    @IsArray()
    @IsString({ each: true })
    actividades: string[];

    @ApiProperty({
        example: faker.location.streetAddress(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    domicilio: string | null;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    telefono: string | null;

    @ApiProperty({
        example: faker.internet.email(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsEmail()
    @IsOptional()
    email: string | null;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    whatsapp: string | null;

    @ApiProperty({
        example: faker.string.uuid(),
    })
    @Expose()
    @IsUUID()
    encargadoId: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsUUID()
    @IsOptional()
    supervisorId: string | null;

    @ApiProperty({
        enum: EstadoSemaforo,
        example: faker.helpers.arrayElement(Object.values(EstadoSemaforo)),
    })
    @Expose()
    @IsEnum(EstadoSemaforo)
    semaforo: EstadoSemaforo;

    @ApiProperty({
        example: true,
    })
    @Expose()
    @IsBoolean()
    activo: boolean;

    @ApiProperty({
        example: faker.lorem.sentence(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    notas: string | null;

    @ApiProperty({
        example: faker.date.past().toISOString(),
    })
    @Expose()
    @IsDate()
    creadoEn: Date;
}

export class ClienteLegajoResponseDto extends ClienteResponseDto {
    @ApiProperty({
        type: [ClienteImpuestoDto],
    })
    @Expose()
    @IsArray()
    impuestos: ClienteImpuestoDto[];

    @ApiProperty({
        example: faker.person.fullName(),
    })
    @Expose()
    @IsString()
    encargadoNombre: string;

    @ApiProperty({
        example: faker.person.fullName(),
        required: false,
        nullable: true,
    })
    @Expose()
    @IsString()
    @IsOptional()
    supervisorNombre: string | null;
}

// ─── Create DTO ──────────────────────────────────────────────────────────────

export class CreateClienteDto {
    @ApiProperty({
        example: '30-12345678-9',
    })
    @IsString()
    @MinLength(10)
    @MaxLength(15)
    cuit: string;

    @ApiProperty({
        example: faker.company.name(),
    })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    denominacion: string;

    @ApiProperty({
        example: 'Responsable Inscripto',
    })
    @IsString()
    @MinLength(1)
    @MaxLength(100)
    condicionIva: string;

    @ApiProperty({
        example: faker.string.uuid(),
    })
    @IsUUID()
    encargadoId: string;

    @ApiProperty({
        example: 0,
        required: false,
    })
    @IsInt()
    @IsOptional()
    termino?: number;

    @ApiProperty({
        example: ['Ventas al por mayor'],
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    actividades?: string[];

    @ApiProperty({
        example: faker.location.streetAddress(),
        required: false,
    })
    @IsString()
    @IsOptional()
    domicilio?: string;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
    })
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiProperty({
        example: faker.internet.email(),
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
    })
    @IsString()
    @IsOptional()
    whatsapp?: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: false,
    })
    @IsUUID()
    @IsOptional()
    supervisorId?: string;

    @ApiProperty({
        example: faker.lorem.sentence(),
        required: false,
    })
    @IsString()
    @IsOptional()
    notas?: string;

    @ApiProperty({
        enum: TipoImpuesto,
        isArray: true,
        example: [],
        required: false,
    })
    @IsArray()
    @IsEnum(TipoImpuesto, { each: true })
    @IsOptional()
    tipoImpuesto?: TipoImpuesto[];
}

// ─── Update DTO ──────────────────────────────────────────────────────────────

export class UpdateClienteDto {
    @ApiProperty({
        example: '30-12345678-9',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(10)
    @MaxLength(15)
    cuit?: string;

    @ApiProperty({
        example: faker.company.name(),
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(200)
    denominacion?: string;

    @ApiProperty({
        example: 'Responsable Inscripto',
        required: false,
    })
    @IsString()
    @IsOptional()
    @MinLength(1)
    @MaxLength(100)
    condicionIva?: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: false,
    })
    @IsUUID()
    @IsOptional()
    encargadoId?: string;

    @ApiProperty({
        example: 0,
        required: false,
    })
    @IsInt()
    @IsOptional()
    termino?: number;

    @ApiProperty({
        example: ['Ventas al por mayor'],
        required: false,
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    actividades?: string[];

    @ApiProperty({
        example: faker.location.streetAddress(),
        required: false,
    })
    @IsString()
    @IsOptional()
    domicilio?: string;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
    })
    @IsString()
    @IsOptional()
    telefono?: string;

    @ApiProperty({
        example: faker.internet.email(),
        required: false,
    })
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty({
        example: faker.phone.number(),
        required: false,
    })
    @IsString()
    @IsOptional()
    whatsapp?: string;

    @ApiProperty({
        example: faker.string.uuid(),
        required: false,
    })
    @IsUUID()
    @IsOptional()
    supervisorId?: string;

    @ApiProperty({
        example: faker.lorem.sentence(),
        required: false,
    })
    @IsString()
    @IsOptional()
    notas?: string;

    @ApiProperty({
        enum: EstadoSemaforo,
        example: EstadoSemaforo.VERDE,
        required: false,
    })
    @IsEnum(EstadoSemaforo)
    @IsOptional()
    semaforo?: EstadoSemaforo;

    @ApiProperty({
        enum: TipoImpuesto,
        isArray: true,
        example: [],
        required: false,
    })
    @IsArray()
    @IsEnum(TipoImpuesto, { each: true })
    @IsOptional()
    tipoImpuesto?: TipoImpuesto[];
}
