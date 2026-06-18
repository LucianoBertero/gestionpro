import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsBoolean } from 'class-validator';

import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

export class AddClienteImpuestoDto {
    @ApiProperty({ enum: TipoImpuesto })
    @IsEnum(TipoImpuesto)
    tipo: TipoImpuesto;
}

export class ToggleClienteImpuestoDto {
    @ApiProperty({ example: true })
    @IsBoolean()
    activo: boolean;
}
