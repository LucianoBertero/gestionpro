import { HttpException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { LiquidacionRepository } from 'src/common/database/repositories/liquidacion.repository';
import { ArchivosLiquidacionesRepository } from 'src/modules/liquidaciones/repositories/archivos-liquidaciones.repository';
import { ArchivosLiquidacionesService } from 'src/modules/liquidaciones/services/archivos-liquidaciones.service';

describe('ArchivosLiquidacionesService', () => {
    let service: ArchivosLiquidacionesService;

    const mockJunctionRepo = {
        attach: jest.fn(),
        detach: jest.fn(),
        findByLiquidacion: jest.fn(),
        findByLiquidacionAndArchivo: jest.fn(),
    };

    const mockLiquidacionRepo = {
        existsById: jest.fn(),
    };

    const mockArchivoRepo = {
        existsById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchivosLiquidacionesService,
                { provide: ArchivosLiquidacionesRepository, useValue: mockJunctionRepo },
                { provide: LiquidacionRepository, useValue: mockLiquidacionRepo },
                { provide: ArchivoRepository, useValue: mockArchivoRepo },
            ],
        }).compile();

        service = module.get<ArchivosLiquidacionesService>(ArchivosLiquidacionesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── attach ──────────────────────────────────────────────────────

    describe('attach', () => {
        const liquidacionId = 20;
        const archivoId = 8;
        const junctionRow = { liquidacionId, archivoId, orden: 0 };

        it('validates liquidacion exists, archivo exists, then creates junction', async () => {
            mockLiquidacionRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            mockJunctionRepo.attach.mockResolvedValue(junctionRow);

            const result = await service.attach(liquidacionId, archivoId);

            expect(mockLiquidacionRepo.existsById).toHaveBeenCalledWith(liquidacionId);
            expect(mockArchivoRepo.existsById).toHaveBeenCalledWith(archivoId);
            expect(mockJunctionRepo.attach).toHaveBeenCalledWith(liquidacionId, archivoId, 0);
            expect(result).toEqual(junctionRow);
        });

        it('throws 404 when liquidacion does not exist', async () => {
            mockLiquidacionRepo.existsById.mockResolvedValue(false);

            await expect(service.attach(liquidacionId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.attach(liquidacionId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockArchivoRepo.existsById).not.toHaveBeenCalled();
            expect(mockJunctionRepo.attach).not.toHaveBeenCalled();
        });

        it('throws 404 when archivo does not exist', async () => {
            mockLiquidacionRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(false);

            await expect(service.attach(liquidacionId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.attach(liquidacionId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockJunctionRepo.attach).not.toHaveBeenCalled();
        });
    });

    // ── detach ──────────────────────────────────────────────────────

    describe('detach', () => {
        const liquidacionId = 20;
        const archivoId = 8;
        const junctionRow = { liquidacionId, archivoId, orden: 0 };

        it('finds the junction and deletes it', async () => {
            mockJunctionRepo.findByLiquidacionAndArchivo.mockResolvedValue(junctionRow);
            mockJunctionRepo.detach.mockResolvedValue(junctionRow);

            const result = await service.detach(liquidacionId, archivoId);

            expect(mockJunctionRepo.findByLiquidacionAndArchivo).toHaveBeenCalledWith(liquidacionId, archivoId);
            expect(mockJunctionRepo.detach).toHaveBeenCalledWith(liquidacionId, archivoId);
            expect(result).toEqual(junctionRow);
        });

        it('throws 404 when junction does not exist', async () => {
            mockJunctionRepo.findByLiquidacionAndArchivo.mockResolvedValue(null);

            await expect(service.detach(liquidacionId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.detach(liquidacionId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockJunctionRepo.detach).not.toHaveBeenCalled();
        });
    });

    // ── findByLiquidacion ───────────────────────────────────────────

    describe('findByLiquidacion', () => {
        const liquidacionId = 20;
        const archivos = [
            {
                liquidacionId: 20,
                archivoId: 8,
                orden: 0,
                archivo: {
                    id: 8,
                    storageKey: 'estudios/1/liquidaciones/20/2026-06/abc.pdf',
                    mimeType: 'application/pdf',
                    extension: 'pdf',
                    bytes: 8000,
                    originalName: 'liq.pdf',
                    tipo: 'DDJJ',
                    periodo: '2026-06',
                    subidoPorId: 'u-1',
                    activo: true,
                    creadoEn: new Date(),
                },
            },
        ];

        it('returns archivos attached to the liquidacion', async () => {
            mockJunctionRepo.findByLiquidacion.mockResolvedValue(archivos);

            const result = await service.findByLiquidacion(liquidacionId);

            expect(mockJunctionRepo.findByLiquidacion).toHaveBeenCalledWith(liquidacionId);
            expect(result).toEqual(archivos);
        });

        it('returns empty array when no archivos are attached', async () => {
            mockJunctionRepo.findByLiquidacion.mockResolvedValue([]);

            const result = await service.findByLiquidacion(liquidacionId);

            expect(result).toEqual([]);
        });
    });
});
