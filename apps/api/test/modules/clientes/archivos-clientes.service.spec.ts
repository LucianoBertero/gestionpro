import { HttpException } from '@nestjs/common';
import { Test, type TestingModule } from '@nestjs/testing';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { ClienteRepository } from 'src/common/database/repositories/cliente.repository';
import { ArchivosClientesRepository } from 'src/modules/clientes/repositories/archivos-clientes.repository';
import { ArchivosClientesService } from 'src/modules/clientes/services/archivos-clientes.service';

describe('ArchivosClientesService', () => {
    let service: ArchivosClientesService;

    const mockJunctionRepo = {
        attach: jest.fn(),
        detach: jest.fn(),
        findByCliente: jest.fn(),
        findByClienteAndArchivo: jest.fn(),
    };

    const mockClienteRepo = {
        existsById: jest.fn(),
    };

    const mockArchivoRepo = {
        existsById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchivosClientesService,
                { provide: ArchivosClientesRepository, useValue: mockJunctionRepo },
                { provide: ClienteRepository, useValue: mockClienteRepo },
                { provide: ArchivoRepository, useValue: mockArchivoRepo },
            ],
        }).compile();

        service = module.get<ArchivosClientesService>(ArchivosClientesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // ── attach ──────────────────────────────────────────────────────

    describe('attach', () => {
        const clienteId = 10;
        const archivoId = 5;
        const junctionRow = { clienteId, archivoId, orden: 0 };

        it('validates cliente exists, archivo exists, then creates junction', async () => {
            mockClienteRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            mockJunctionRepo.attach.mockResolvedValue(junctionRow);

            const result = await service.attach(clienteId, archivoId);

            expect(mockClienteRepo.existsById).toHaveBeenCalledWith(clienteId);
            expect(mockArchivoRepo.existsById).toHaveBeenCalledWith(archivoId);
            expect(mockJunctionRepo.attach).toHaveBeenCalledWith(clienteId, archivoId, 0);
            expect(result).toEqual(junctionRow);
        });

        it('passes custom orden to the repository', async () => {
            mockClienteRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            mockJunctionRepo.attach.mockResolvedValue({ clienteId, archivoId, orden: 3 });

            const result = await service.attach(clienteId, archivoId, 3);

            expect(mockJunctionRepo.attach).toHaveBeenCalledWith(clienteId, archivoId, 3);
            expect(result).toEqual({ clienteId, archivoId, orden: 3 });
        });

        it('throws 404 when cliente does not exist', async () => {
            mockClienteRepo.existsById.mockResolvedValue(false);

            await expect(service.attach(clienteId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.attach(clienteId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockArchivoRepo.existsById).not.toHaveBeenCalled();
            expect(mockJunctionRepo.attach).not.toHaveBeenCalled();
        });

        it('throws 404 when archivo does not exist', async () => {
            mockClienteRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(false);

            await expect(service.attach(clienteId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.attach(clienteId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockJunctionRepo.attach).not.toHaveBeenCalled();
        });

        it('propagates database errors from the junction repository', async () => {
            mockClienteRepo.existsById.mockResolvedValue(true);
            mockArchivoRepo.existsById.mockResolvedValue(true);
            mockJunctionRepo.attach.mockRejectedValue(new Error('DB constraint violation'));

            await expect(service.attach(clienteId, archivoId)).rejects.toThrow('DB constraint violation');
        });
    });

    // ── detach ──────────────────────────────────────────────────────

    describe('detach', () => {
        const clienteId = 10;
        const archivoId = 5;
        const junctionRow = { clienteId, archivoId, orden: 0 };

        it('finds the junction and deletes it', async () => {
            mockJunctionRepo.findByClienteAndArchivo.mockResolvedValue(junctionRow);
            mockJunctionRepo.detach.mockResolvedValue(junctionRow);

            const result = await service.detach(clienteId, archivoId);

            expect(mockJunctionRepo.findByClienteAndArchivo).toHaveBeenCalledWith(clienteId, archivoId);
            expect(mockJunctionRepo.detach).toHaveBeenCalledWith(clienteId, archivoId);
            expect(result).toEqual(junctionRow);
        });

        it('throws 404 when junction does not exist', async () => {
            mockJunctionRepo.findByClienteAndArchivo.mockResolvedValue(null);

            await expect(service.detach(clienteId, archivoId)).rejects.toThrow(HttpException);
            await expect(service.detach(clienteId, archivoId)).rejects.toMatchObject({
                status: 404,
            });
            expect(mockJunctionRepo.detach).not.toHaveBeenCalled();
        });
    });

    // ── findByCliente ───────────────────────────────────────────────

    describe('findByCliente', () => {
        const clienteId = 10;
        const archivos = [
            {
                clienteId: 10,
                archivoId: 5,
                orden: 0,
                archivo: {
                    id: 5,
                    storageKey: 'estudios/1/clientes/10/2026-06/abc.pdf',
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

        it('returns archivos attached to the cliente', async () => {
            mockJunctionRepo.findByCliente.mockResolvedValue(archivos);

            const result = await service.findByCliente(clienteId);

            expect(mockJunctionRepo.findByCliente).toHaveBeenCalledWith(clienteId);
            expect(result).toEqual(archivos);
        });

        it('returns empty array when no archivos are attached', async () => {
            mockJunctionRepo.findByCliente.mockResolvedValue([]);

            const result = await service.findByCliente(clienteId);

            expect(result).toEqual([]);
        });
    });
});
