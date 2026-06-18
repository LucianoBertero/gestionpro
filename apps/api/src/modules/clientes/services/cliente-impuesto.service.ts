import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';

import { ClienteRepository } from 'src/common/database/repositories/cliente.repository';
import { TipoImpuesto } from 'src/common/database/enums/tipo-impuesto.enum';

import type { ClienteImpuestoDto } from '../dtos/clientes.dto';

@Injectable()
export class ClienteImpuestoService {
    private readonly logger = new Logger(ClienteImpuestoService.name);

    constructor(private readonly clienteRepository: ClienteRepository) {}

    /**
     * Activa un impuesto para el cliente. Idempotente: si ya existe (activo o no), lo reactiva.
     * Si no existe, lo crea como activo.
     */
    async add(clienteId: number, tipo: TipoImpuesto): Promise<ClienteImpuestoDto> {
        await this.assertCliente(clienteId);
        await this.clienteRepository.upsertImpuesto(clienteId, tipo, true);
        return this.getByTipo(clienteId, tipo);
    }

    /**
     * Soft-delete de un impuesto del cliente (activo=false).
     * No borra el registro: preserva histórico de Liquidaciones referidas a ese impuesto.
     */
    async remove(clienteId: number, clienteImpuestoId: number): Promise<ClienteImpuestoDto> {
        await this.assertCliente(clienteId);
        await this.assertImpuesto(clienteId, clienteImpuestoId);
        await this.clienteRepository.softDeleteImpuesto(clienteImpuestoId);
        return this.getById(clienteId, clienteImpuestoId);
    }

    /**
     * Toggle activo/inactivo de un impuesto.
     */
    async toggle(
        clienteId: number,
        clienteImpuestoId: number,
        activo: boolean,
    ): Promise<ClienteImpuestoDto> {
        await this.assertCliente(clienteId);
        await this.assertImpuesto(clienteId, clienteImpuestoId);
        await this.clienteRepository.toggleImpuesto(clienteImpuestoId, activo);
        return this.getById(clienteId, clienteImpuestoId);
    }

    // ─── Helpers ──────────────────────────────────────────────────────────

    private async getById(clienteId: number, clienteImpuestoId: number): Promise<ClienteImpuestoDto> {
        const cliente = await this.clienteRepository.findById(clienteId);
        const imp = cliente?.impuestos.find((i) => i.id === clienteImpuestoId);
        if (!imp) {
            throw new HttpException('clientes.error.impuestoNotFound', HttpStatus.NOT_FOUND);
        }
        return { id: imp.id, tipo: imp.tipo, activo: imp.activo };
    }

    private async getByTipo(clienteId: number, tipo: TipoImpuesto): Promise<ClienteImpuestoDto> {
        const cliente = await this.clienteRepository.findById(clienteId);
        const imp = cliente?.impuestos.find((i) => i.tipo === tipo);
        if (!imp) {
            throw new HttpException('clientes.error.impuestoNotFound', HttpStatus.NOT_FOUND);
        }
        return { id: imp.id, tipo: imp.tipo, activo: imp.activo };
    }

    private async assertCliente(clienteId: number): Promise<void> {
        const exists = await this.clienteRepository.existsById(clienteId);
        if (!exists) {
            throw new HttpException('clientes.error.clienteNotFound', HttpStatus.NOT_FOUND);
        }
    }

    private async assertImpuesto(clienteId: number, clienteImpuestoId: number): Promise<void> {
        const cliente = await this.clienteRepository.findById(clienteId);
        const exists = cliente?.impuestos.some((i) => i.id === clienteImpuestoId);
        if (!exists) {
            throw new HttpException('clientes.error.impuestoNotFound', HttpStatus.NOT_FOUND);
        }
    }
}
