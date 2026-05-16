import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from 'src/common/database/services/database.service';
import { EstadoTarea } from 'src/common/database/enums/estado-tarea.enum';
import { EstadoSemaforo } from 'src/common/database/enums/estado-semaforo.enum';

@Injectable()
export class DashboardService {
    private readonly logger = new Logger(DashboardService.name);
    constructor(private readonly db: DatabaseService) {}

    async getMetricas() {
        const [totalClientes, tareasPendientes, tareasUrgentes, alertasSemaforo] = await Promise.all([
            this.db.cliente.count({ where: { activo: true } }),
            this.db.tarea.count({ where: { activo: true, estado: { not: EstadoTarea.COMPLETADA } } }),
            this.db.tarea.count({
                where: {
                    activo: true,
                    estado: { not: EstadoTarea.COMPLETADA },
                    prioridad: 'ALTA',
                },
            }),
            this.db.cliente.count({ where: { activo: true, semaforo: EstadoSemaforo.ROJO } }),
        ]);

        return {
            totalClientes,
            tareasPendientes,
            tareasUrgentes,
            alertasSemaforo,
        };
    }

    async getSemaforos() {
        const [verde, amarillo, rojo] = await Promise.all([
            this.db.cliente.count({ where: { activo: true, semaforo: EstadoSemaforo.VERDE } }),
            this.db.cliente.count({ where: { activo: true, semaforo: EstadoSemaforo.AMARILLO } }),
            this.db.cliente.count({ where: { activo: true, semaforo: EstadoSemaforo.ROJO } }),
        ]);
        return { verde, amarillo, rojo };
    }

    async getTareasPorColaborador() {
        const tareas = await this.db.tarea.findMany({
            where: { activo: true, estado: { not: EstadoTarea.COMPLETADA } },
            include: { encargado: { select: { id: true, nombre: true } } },
        });

        const map = new Map<string, { nombre: string; pendientes: number; alta: number }>();
        for (const t of tareas) {
            const entry = map.get(t.encargadoId) || { nombre: t.encargado.nombre, pendientes: 0, alta: 0 };
            entry.pendientes++;
            if (t.prioridad === 'ALTA') entry.alta++;
            map.set(t.encargadoId, entry);
        }

        return Array.from(map.entries()).map(([id, data]) => ({
            usuarioId: id,
            ...data,
        }));
    }

    async getVencimientosSemana() {
        const ahora = new Date();
        const en7Dias = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);

        return this.db.tarea.findMany({
            where: {
                activo: true,
                estado: { not: EstadoTarea.COMPLETADA },
                vence: { gte: ahora, lte: en7Dias },
            },
            include: {
                encargado: { select: { id: true, nombre: true } },
                cliente: { select: { id: true, denominacion: true } },
            },
            orderBy: { vence: 'asc' },
        });
    }
}
