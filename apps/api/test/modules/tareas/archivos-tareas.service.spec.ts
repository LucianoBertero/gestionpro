import { HttpException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { TareaRepository } from 'src/common/database/repositories/tarea.repository';
import { ArchivosTareasRepository } from 'src/modules/tareas/repositories/archivos-tareas.repository';
import { ArchivosTareasService } from 'src/modules/tareas/services/archivos-tareas.service';

describe('ArchivosTareasService', () => {
    let service: ArchivosTareasService;

    const mockJunctionRepo = {
        attach: jest.fn(),
        detach: jest.fn(),
        findByTarea: jest.fn(),
        findByTareaAndArchivo: jest.fn(),
    };

    const mockTareaRepo = {
        existsById: jest.fn(),
    };

    const mockArchivoRepo = {
        existsById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchivosTareasService,
                { provide: ArchivosTareasRepository, useValue: mockJunctionRepo },
                { provide: TareaRepository, useValue: mockTareaRepo },
                { provide: ArchivoRepository, useValue: mockArchivoRepo },
            ],
        }).compile();

        service = module.get<ArchivosTareasService>(ArchivosTareasService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── attach ──────────────────────────────────────────────────────

    describe('attach', () => {
        const tareaId = 1;
        const archivoId = 5;
        const orden = 0;

        const junctionRow = { tareaId, archivoId, orden };

        it('validates tarea exists, archivo exists, then creates junction', async () => {
            mockTareaRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            mockJunctionRepo.attach.mockResolvedValue(junctionRow);

            const result = await service.attach(tareaId, archivoId);

            expect(mockTareaRepo.existsById).toHaveBeenCalledWith(tareaId);
            expect(mockArchivoRepo.existsById).toHaveBeenCalledWith(archivoId);
            expect(mockJunctionRepo.attach).toHaveBeenCalledWith(tareaId, archivoId, 0);
            expect(result).toEqual(junctionRow);
        });

        it('passes custom orden to the repository', async () => {
            mockTareaRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            mockJunctionRepo.attach.mockResolvedValue({ tareaId, archivoId, orden: 2 });

            const result = await service.attach(tareaId, archivoId, 2);

            expect(mockJunctionRepo.attach).toHaveBeenCalledWith(tareaId, archivoId, 2);
            expect(result).toEqual({ tareaId, archivoId, orden: 2 });
        });

        it('throws 404 when tarea does not exist', async () => {
            mockTareaRepo.existsById.mockResolvedValue(false);

            await expect(service.attach(tareaId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.attach(tareaId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockArchivoRepo.existsById).not.toHaveBeenCalled();
            expect(mockJunctionRepo.attach).not.toHaveBeenCalled();
        });

        it('throws 404 when archivo does not exist', async () => {
            mockTareaRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(false);

            await expect(service.attach(tareaId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.attach(tareaId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockJunctionRepo.attach).not.toHaveBeenCalled();
        });

        it('propagates database errors from the junction repository', async () => {
            mockTareaRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            const dbError = new Error('DB constraint violation');
            mockJunctionRepo.attach.mockRejectedValue(dbError);

            await expect(service.attach(tareaId, archivoId)).rejects.toThrow('DB constraint violation');
            expect(mockJunctionRepo.attach).toHaveBeenCalledWith(tareaId, archivoId, 0);
        });
    });

    // ── detach ──────────────────────────────────────────────────────

    describe('detach', () => {
        const tareaId = 1;
        const archivoId = 5;

        const junctionRow = { tareaId, archivoId, orden: 0 };

        it('finds the junction and deletes it', async () => {
            mockJunctionRepo.findByTareaAndArchivo.mockResolvedValue(junctionRow);
            mockJunctionRepo.detach.mockResolvedValue(junctionRow);

            const result = await service.detach(tareaId, archivoId);

            expect(mockJunctionRepo.findByTareaAndArchivo).toHaveBeenCalledWith(tareaId, archivoId);
            expect(mockJunctionRepo.detach).toHaveBeenCalledWith(tareaId, archivoId);
            expect(result).toEqual(junctionRow);
        });

        it('throws 404 when junction does not exist', async () => {
            mockJunctionRepo.findByTareaAndArchivo.mockResolvedValue(null);

            await expect(service.detach(tareaId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.detach(tareaId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockJunctionRepo.detach).not.toHaveBeenCalled();
        });
    });

    // ── findByTarea ─────────────────────────────────────────────────

    describe('findByTarea', () => {
        const tareaId = 1;

        const archivos = [
            {
                tareaId: 1,
                archivoId: 5,
                orden: 0,
                archivo: {
                    id: 5,
                    storageKey: 'estudios/1/tareas/1/2026-06/abc.pdf',
                    mimeType: 'application/pdf',
                    extension: 'pdf',
                    bytes: 5000,
                    originalName: 'doc.pdf',
                    tipo: 'OTRO',
                    periodo: '2026-06',
                    subidoPorId: 'u-1',
                    activo: true,
                    creadoEn: new Date(),
                },
            },
        ];

        it('returns archivos attached to the tarea', async () => {
            mockJunctionRepo.findByTarea.mockResolvedValue(archivos);

            const result = await service.findByTarea(tareaId);

            expect(mockJunctionRepo.findByTarea).toHaveBeenCalledWith(tareaId);
            expect(result).toEqual(archivos);
        });

        it('returns empty array when no archivos are attached', async () => {
            mockJunctionRepo.findByTarea.mockResolvedValue([]);

            const result = await service.findByTarea(tareaId);

            expect(result).toEqual([]);
        });
    });
});
