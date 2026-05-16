import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { LiquidacionRepository } from 'src/common/database/repositories/liquidacion.repository';
import type { IAuthUser } from 'src/common/request/interfaces/request.interface';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

import type { LiquidacionFindAllOptions } from 'src/common/database/interfaces/liquidacion.interface';
import type { CreateLiquidacionDto, LiquidacionResponseDto, UpdateLiquidacionDto } from '../dtos/liquidaciones.dto';

@Injectable()
export class LiquidacionService {
    private readonly logger = new Logger(LiquidacionService.name);

    constructor(private readonly liquidacionRepository: LiquidacionRepository) {}

    async findAll(
        options: LiquidacionFindAllOptions,
    ): Promise<LiquidacionResponseDto[]> {
        return this.liquidacionRepository.findAll(options) as any;
    }

    async countAll(options: LiquidacionFindAllOptions): Promise<number> {
        return this.liquidacionRepository.countAll(options);
    }

    async findById(id: number): Promise<LiquidacionResponseDto> {
        const liq = await this.liquidacionRepository.findById(id);
        if (!liq) {
            throw new HttpException('liquidaciones.error.notFound', HttpStatus.NOT_FOUND);
        }
        return liq as any;
    }

    async findByClienteId(clienteId: number): Promise<LiquidacionResponseDto[]> {
        return this.liquidacionRepository.findByClienteId(clienteId) as any;
    }

    async findHistorialCliente(clienteId: number): Promise<LiquidacionResponseDto[]> {
        return this.liquidacionRepository.findHistorialCliente(clienteId) as any;
    }

    async create(
        dto: CreateLiquidacionDto,
        authUser: IAuthUser,
    ): Promise<LiquidacionResponseDto> {
        // Auto-calculate reference import from previous period
        const importeRef = await this.liquidacionRepository.findImporteAnterior(
            dto.clienteId,
            dto.impuesto,
            dto.periodo,
        );

        const data = {
            ...dto,
            importeRef,
            cargadoPorId: authUser.userId,
            origenCarga: 'MANUAL',
        };

        return this.liquidacionRepository.create(data) as any;
    }

    async update(id: number, dto: UpdateLiquidacionDto): Promise<LiquidacionResponseDto> {
        await this.assertExists(id);
        return this.liquidacionRepository.update(id, dto) as any;
    }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.assertExists(id);
        await this.liquidacionRepository.softDelete(id);
        return { success: true, message: 'liquidaciones.success.deleted' };
    }

    private async assertExists(id: number): Promise<void> {
        const exists = await this.liquidacionRepository.existsById(id);
        if (!exists) {
            throw new HttpException('liquidaciones.error.notFound', HttpStatus.NOT_FOUND);
        }
    }
}
