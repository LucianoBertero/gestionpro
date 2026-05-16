import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/services/database.service';

@Injectable()
export class FinancieroService {
    private readonly logger = new Logger(FinancieroService.name);
    constructor(private readonly db: DatabaseService) {}

    async getHonorarios(periodo?: string) {
        const clientes = await this.db.cliente.findMany({
            where: { activo: true },
            select: {
                id: true,
                denominacion: true,
                honorarioMensual: true,
                encargado: { select: { id: true, nombre: true } },
            },
            orderBy: { denominacion: 'asc' },
        });

        return clientes.map((c) => ({
            clienteId: c.id,
            denominacion: c.denominacion,
            honorarioMensual: c.honorarioMensual?.toNumber() ?? 0,
            encargadoNombre: c.encargado.nombre,
        }));
    }

    async getRentabilidad() {
        const clientes = await this.db.cliente.findMany({
            where: { activo: true },
            select: {
                id: true,
                denominacion: true,
                honorarioMensual: true,
                encargado: { select: { nombre: true } },
            },
        });

        const tareas = await this.db.tarea.findMany({
            where: { activo: true },
            select: { clienteId: true, tiempoEstMin: true },
        });

        const tiempoPorCliente = new Map<number, number>();
        for (const t of tareas) {
            if (t.clienteId) {
                tiempoPorCliente.set(t.clienteId, (tiempoPorCliente.get(t.clienteId) ?? 0) + (t.tiempoEstMin ?? 0));
            }
        }

        return clientes.map((c) => {
            const honorario = c.honorarioMensual?.toNumber() ?? 0;
            const tiempoMin = tiempoPorCliente.get(c.id) ?? 0;
            const ratio = tiempoMin > 0 ? honorario / (tiempoMin / 60) : 0;
            return {
                clienteId: c.id,
                denominacion: c.denominacion,
                honorarioMensual: honorario,
                tiempoTotalMin: tiempoMin,
                ratioHora: Math.round(ratio * 100) / 100,
                encargadoNombre: c.encargado.nombre,
            };
        });
    }

    async getProyeccion() {
        const clientes = await this.db.cliente.findMany({
            where: { activo: true },
            select: { honorarioMensual: true },
        });

        const total = clientes.reduce((sum, c) => sum + (c.honorarioMensual?.toNumber() ?? 0), 0);
        return { ingresosProyectados: total, totalClientesActivos: clientes.length };
    }
}
