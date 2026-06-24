import { faker } from '@faker-js/faker';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    IsUUID,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { TipoEvento } from 'src/common/database/enums/tipo-evento.enum';
import { OrigenEvento } from 'src/common/database/enums/origen-evento.enum';

export class CreateAgendaItemDto {
    @ApiProperty({
        example: faker.lorem.words(3),
        minLength: 1,
        maxLength: 200,
    })
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    titulo: string;

    @ApiProperty({
        example: faker.date.soon().toISOString(),
        description: 'Event start datetime (ISO 8601)',
    })
    @IsDateString()
    fecha: string;

    @ApiPropertyOptional({
        example: faker.date.soon().toISOString(),
        description: 'Event end datetime for multi-day events',
    })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiPropertyOptional({
        example: false,
        default: false,
        description: 'Whether this is an all-day event (no specific time)',
    })
    @IsOptional()
    @IsBoolean()
    allDay?: boolean;

    @ApiProperty({
        example: 60,
        minimum: 1,
        maximum: 1440,
        description: 'Duration in minutes',
    })
    @IsInt()
    @Min(1)
    @Max(1440)
    duracionMin: number;

    @ApiProperty({
        enum: TipoEvento,
        example: 'PERSONAL',
    })
    @IsEnum(TipoEvento)
    tipo: TipoEvento;

    @ApiPropertyOptional({
        example: faker.lorem.sentence(),
    })
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({
        example: 1,
    })
    @IsOptional()
    @IsInt()
    tareaId?: number;

    @ApiPropertyOptional({
        example: false,
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    esEstudio?: boolean;

    @ApiPropertyOptional({
        example: faker.string.uuid(),
        description: 'Target user (SOCIO only)',
    })
    @IsOptional()
    @IsUUID()
    usuarioId?: string;

    @ApiPropertyOptional({
        example: 'FREQ=WEEKLY;BYDAY=TU,TH;UNTIL=20260630T235959Z',
        description: 'RFC 5545 RRULE string for recurring events',
        maxLength: 500,
    })
    @IsOptional()
    @IsString()
    @MaxLength(500)
    @Matches(/^FREQ=(DAILY|WEEKLY|MONTHLY|YEARLY)/, {
        message: 'recurrenceRule must start with FREQ=DAILY|WEEKLY|MONTHLY|YEARLY',
    })
    recurrenceRule?: string;

    @ApiPropertyOptional({
        example: faker.date.soon().toISOString(),
        description: 'End date for recurrence (sync with RRULE UNTIL)',
    })
    @IsOptional()
    @IsDateString()
    recurrenceEnd?: string;

    @ApiPropertyOptional({
        enum: OrigenEvento,
        example: 'MANUAL',
        default: 'MANUAL',
    })
    @IsOptional()
    @IsEnum(OrigenEvento)
    origen?: OrigenEvento;
}
