import { Controller, Get, Param, ParseArrayPipe, ParseIntPipe, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { EstadoSemaforo } from 'src/common/database/enums/estado-semaforo.enum';
import { ApiEndpoint } from 'src/common/doc/decorators/doc.api-endpoint.decorator';
import { AuthUser } from 'src/common/request/decorators/auth-user.decorator';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';

import {
    ClienteLegajoResponseDto,
    ClienteResponseDto,
} from '../dtos/clientes.dto';
import { ClienteService } from '../services/clientes.service';

const VALID_SEMAFOROS = new Set<string>(Object.values(EstadoSemaforo));

@ApiTags('public.clientes')
@ApiBearerAuth('accessToken')
@Controller({ path: '/clientes', version: '1' })
export class ClientesPublicController {
    constructor(private readonly clienteService: ClienteService) {}

    @Get()
    @ApiEndpoint({
        summary: 'List clientes with optional filters',
        serialization: ClienteResponseDto,
        paginated: true,
        messageKey: 'clientes.success.list',
    })
    async findAll(
        @AuthUser() user: IAuthUser,
        @Query('search') search?: string,
        @Query('semaforo', new ParseArrayPipe({ items: String, separator: ',', optional: true }))
        semaforo?: string[],
        @Query('encargadoId') encargadoId?: string,
        @Query('skip') skip?: string,
        @Query('take') take?: string
    ): Promise<{ data: ClienteResponseDto[]; total: number; skip: number; take: number }> {
        const parsedSkip = skip ? parseInt(skip, 10) : 0;
        const parsedTake = take ? parseInt(take, 10) : 20;

        const semaforoFiltered = semaforo?.filter((s) =>
            VALID_SEMAFOROS.has(s)
        ) as EstadoSemaforo[] | undefined;

        const options = {
            search,
            semaforo:
                semaforoFiltered && semaforoFiltered.length === 1
                    ? semaforoFiltered[0]
                    : semaforoFiltered,
            encargadoId,
            skip: parsedSkip,
            take: parsedTake,
        };
        const [data, total] = await Promise.all([
            this.clienteService.findAll(options, user),
            this.clienteService.countAll(options, user),
        ]);
        return { data, total, skip: parsedSkip, take: parsedTake };
    }

    @Get(':id')
    @ApiEndpoint({
        summary: 'Get cliente by ID',
        serialization: ClienteResponseDto,
        messageKey: 'clientes.success.retrieved',
    })
    findById(
        @Param('id', ParseIntPipe) id: number,
        @AuthUser() user: IAuthUser
    ): Promise<ClienteResponseDto> {
        return this.clienteService.findById(id, user);
    }

    @Get(':id/legajo')
    @ApiEndpoint({
        summary: 'Get complete cliente legajo (with impuestos, encargado, supervisor)',
        serialization: ClienteLegajoResponseDto,
        messageKey: 'clientes.success.legajoRetrieved',
    })
    findLegajo(
        @Param('id', ParseIntPipe) id: number,
        @AuthUser() user: IAuthUser
    ): Promise<ClienteLegajoResponseDto> {
        return this.clienteService.findLegajo(id, user);
    }
}
