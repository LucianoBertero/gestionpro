import { ApiPropertyOptional } from '@nestjs/swagger';
import {
    IsBoolean,
    IsDateString,
    IsEnum,
    IsInt,
    IsOptional,
    IsString,
    Matches,
    Max,
    MaxLength,
    Min,
    MinLength,
} from 'class-validator';
import { TipoEvento } from 'src/common/database/enums/tipo-evento.enum';

export class UpdateAgendaItemDto {
    @ApiPropertyOptional({
        minLength: 1,
        maxLength: 200,
    })
    @IsOptional()
    @IsString()
    @MinLength(1)
    @MaxLength(200)
    titulo?: string;

    @ApiPropertyOptional({
        description: 'Event start datetime (ISO 8601)',
    })
    @IsOptional()
    @IsDateString()
    fecha?: string;

    @ApiPropertyOptional({
        description: 'Event end datetime for multi-day events',
    })
    @IsOptional()
    @IsDateString()
    fechaFin?: string;

    @ApiPropertyOptional({
        description: 'Whether this is an all-day event',
    })
    @IsOptional()
    @IsBoolean()
    allDay?: boolean;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 1440,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(1440)
    duracionMin?: number;

    @ApiPropertyOptional({
        enum: TipoEvento,
    })
    @IsOptional()
    @IsEnum(TipoEvento)
    tipo?: TipoEvento;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    descripcion?: string;

    @ApiPropertyOptional({
        default: false,
    })
    @IsOptional()
    @IsBoolean()
    esEstudio?: boolean;

    @ApiPropertyOptional({
        description: 'RFC 5545 RRULE string',
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
        description: 'End date for recurrence',
    })
    @IsOptional()
    @IsDateString()
    recurrenceEnd?: string;
}
