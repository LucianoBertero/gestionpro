import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { EstadoSemaforo } from 'src/common/database/enums/estado-semaforo.enum';
// MVP mode: sin restricciones de rol
// import { UserRole } from 'src/common/database/enums/role.enum';
import type {
    ClienteEntity,
    ClienteFindAllOptions,
} from 'src/common/database/interfaces/cliente.interface';
import { ClienteRepository } from 'src/common/database/repositories/cliente.repository';
import { LiquidacionRepository } from 'src/common/database/repositories/liquidacion.repository';
import { TareaRepository } from 'src/common/database/repositories/tarea.repository';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';
import { normalizeCuit, isValidCuit } from 'src/common/utils/cuit.utils';

import type {
    ClienteLegajoResponseDto,
    ClienteResponseDto,
    CreateClienteDto,
    UpdateClienteDto,
} from '../dtos/clientes.dto';

@Injectable()
export class ClienteService {
    private readonly logger = new Logger(ClienteService.name);

    constructor(
        private readonly clienteRepository: ClienteRepository,
        private readonly tareaRepository: TareaRepository,
        private readonly liquidacionRepository: LiquidacionRepository,
    ) {}

    // ─── COLABORADOR auto-filter helper ──────────────────────────────────

    // MVP mode: sin filtro de COLABORADOR
    private applyCollaboradorFilter(
        options: ClienteFindAllOptions,
        _authUser: IAuthUser
    ): ClienteFindAllOptions {
        return options;
    }

    private assertCollaboradorAccess(
        _cliente: ClienteEntity | null,
        _authUser: IAuthUser
    ): void {
        // MVP: sin restricciones
    }

    // ─── Queries ─────────────────────────────────────────────────────────

    async findAll(
        options: ClienteFindAllOptions,
        authUser: IAuthUser
    ): Promise<ClienteResponseDto[]> {
        const filtered = this.applyCollaboradorFilter(options, authUser);
        return this.clienteRepository.findAll(filtered);
    }

    async countAll(
        options: ClienteFindAllOptions,
        authUser: IAuthUser
    ): Promise<number> {
        const filtered = this.applyCollaboradorFilter(options, authUser);
        return this.clienteRepository.countAll(filtered);
    }

    async findById(
        id: number,
        authUser: IAuthUser
    ): Promise<ClienteResponseDto> {
        const cliente = await this.clienteRepository.findById(id);
        if (!cliente) {
            throw new HttpException(
                'clientes.error.clienteNotFound',
                HttpStatus.NOT_FOUND
            );
        }
        this.assertCollaboradorAccess(cliente, authUser);
        return cliente;
    }

    async findLegajo(
        id: number,
        authUser: IAuthUser
    ): Promise<ClienteLegajoResponseDto> {
        const legajo = await this.clienteRepository.findLegajo(id);
        if (!legajo) {
            throw new HttpException(
                'clientes.error.clienteNotFound',
                HttpStatus.NOT_FOUND
            );
        }
        this.assertCollaboradorAccess(legajo, authUser);

        return {
            ...legajo,
            impuestos: legajo.impuestos,
            encargadoNombre: legajo.encargado.nombre,
            supervisorNombre: legajo.supervisor?.nombre ?? null,
        } as unknown as ClienteLegajoResponseDto;
    }

    // ─── Mutations ───────────────────────────────────────────────────────

    async create(dto: CreateClienteDto): Promise<ClienteResponseDto> {
        // Validate and normalize CUIT
        if (!isValidCuit(dto.cuit)) {
            throw new HttpException(
                'clientes.error.cuitInvalido',
                HttpStatus.BAD_REQUEST
            );
        }

        const normalizedCuit = normalizeCuit(dto.cuit);

        await this.assertNotDuplicateCuit(normalizedCuit);

        const data = {
            ...dto,
            cuit: normalizedCuit,
            semaforo: EstadoSemaforo.VERDE,
        };

        return this.clienteRepository.create(data);
    }

    async update(
        id: number,
        dto: UpdateClienteDto
    ): Promise<ClienteResponseDto> {
        await this.assertExists(id);

        if (dto.cuit) {
            if (!isValidCuit(dto.cuit)) {
                throw new HttpException(
                    'clientes.error.cuitInvalido',
                    HttpStatus.BAD_REQUEST
                );
            }
            dto.cuit = normalizeCuit(dto.cuit);
            await this.assertNotDuplicateCuit(dto.cuit, id);
        }

        return this.clienteRepository.update(id, dto);
    }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.assertExists(id);
        await this.clienteRepository.softDelete(id);
        return {
            success: true,
            message: 'clientes.success.clienteDeleted',
        };
    }

    // ─── Semáforo ────────────────────────────────────────────────────────

    async calcularSemaforo(clienteId: number): Promise<EstadoSemaforo> {
        // SQL: count overdue tasks (vence < now)
        const vencidas = await this.tareaRepository.countVencidas(clienteId);
        if (vencidas > 0) return EstadoSemaforo.ROJO;

        // SQL: count tasks due within 5 days
        const proximas = await this.tareaRepository.countProximasVencer(clienteId, 5);
        if (proximas > 0) return EstadoSemaforo.AMARILLO;

        return EstadoSemaforo.VERDE;
    }

    // ─── Assertions ──────────────────────────────────────────────────────

    private async assertExists(id: number): Promise<void> {
        const exists = await this.clienteRepository.existsById(id);
        if (!exists) {
            throw new HttpException(
                'clientes.error.clienteNotFound',
                HttpStatus.NOT_FOUND
            );
        }
    }

    private async assertNotDuplicateCuit(
        cuit: string,
        excludeId?: number
    ): Promise<void> {
        const exists = await this.clienteRepository.existsByCuit(
            cuit,
            excludeId
        );
        if (exists) {
            throw new HttpException(
                'clientes.error.cuitDuplicate',
                HttpStatus.CONFLICT
            );
        }
    }
}
