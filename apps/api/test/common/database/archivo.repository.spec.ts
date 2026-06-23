import { Test, type TestingModule } from '@nestjs/testing';

import { ArchivoRepository } from 'src/common/database/repositories/archivo.repository';
import { DatabaseService } from 'src/common/database/services/database.service';

const mockArchivoDelegate = {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
};

const mockArchivosClienteDelegate = {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
};

const mockArchivosTareaDelegate = {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
};

const mockArchivosLiquidacionDelegate = {
    findMany: jest.fn(),
    create: jest.fn(),
    deleteMany: jest.fn(),
};

const mockDb = {
    archivo: mockArchivoDelegate,
    archivosCliente: mockArchivosClienteDelegate,
    archivosTarea: mockArchivosTareaDelegate,
    archivosLiquidacion: mockArchivosLiquidacionDelegate,
};

describe('ArchivoRepository', () => {
    let repository: ArchivoRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ArchivoRepository,
                { provide: DatabaseService, useValue: mockDb },
            ],
        }).compile();

        repository = module.get<ArchivoRepository>(ArchivoRepository);
    });

    it('should be defined', () => expect(repository).toBeDefined());

    describe('findByParent', () => {
        it('returns empty array for cliente parent when no archivos exist', async () => {
            mockArchivosClienteDelegate.findMany.mockResolvedValue([]);

            const result = await repository.findByParent('cliente', 1);

            expect(result).toEqual([]);
            expect(mockArchivosClienteDelegate.findMany).toHaveBeenCalledWith({
                where: { clienteId: 1 },
                include: expect.any(Object),
            });
        });

        it('returns archivos for tarea parent', async () => {
            const archivos = [
                {
                    archivo: {
                        id: 1,
                        storageKey: 'estudios/1/tareas/5/2026-06/uuid.pdf',
                        mimeType: 'application/pdf',
                        bytes: 2048,
                        extension: 'pdf',
                        originalName: 'report.pdf',
                        tipo: 'DDJJ',
                        periodo: '2026-05',
                        subidoPorId: 'user-1',
                        activo: true,
                        creadoEn: new Date(),
                    },
                },
            ];
            mockArchivosTareaDelegate.findMany.mockResolvedValue(archivos);

            const result = await repository.findByParent('tarea', 5);

            expect(result).toEqual(archivos);
            expect(mockArchivosTareaDelegate.findMany).toHaveBeenCalledWith({
                where: { tareaId: 5 },
                include: expect.any(Object),
            });
        });
    });

    describe('createJunction', () => {
        it('creates a junction row for cliente parent', async () => {
            mockArchivosClienteDelegate.create.mockResolvedValue({
                clienteId: 1,
                archivoId: 1,
                orden: 0,
            });

            await repository.createJunction('cliente', 1, 1);

            expect(mockArchivosClienteDelegate.create).toHaveBeenCalledWith({
                data: { clienteId: 1, archivoId: 1, orden: 0 },
            });
        });

        it('creates a junction row for liquidacion parent', async () => {
            mockArchivosLiquidacionDelegate.create.mockResolvedValue({
                liquidacionId: 3,
                archivoId: 2,
                orden: 0,
            });

            await repository.createJunction('liquidacion', 3, 2);

            expect(mockArchivosLiquidacionDelegate.create).toHaveBeenCalledWith({
                data: { liquidacionId: 3, archivoId: 2, orden: 0 },
            });
        });
    });

    describe('deleteJunctions', () => {
        it('deletes junction rows from all three tables for an archivoId', async () => {
            mockArchivosClienteDelegate.deleteMany.mockResolvedValue({ count: 1 });
            mockArchivosTareaDelegate.deleteMany.mockResolvedValue({ count: 0 });
            mockArchivosLiquidacionDelegate.deleteMany.mockResolvedValue({ count: 0 });

            await repository.deleteJunctions(1);

            expect(mockArchivosClienteDelegate.deleteMany).toHaveBeenCalledWith({
                where: { archivoId: 1 },
            });
            expect(mockArchivosTareaDelegate.deleteMany).toHaveBeenCalledWith({
                where: { archivoId: 1 },
            });
            expect(mockArchivosLiquidacionDelegate.deleteMany).toHaveBeenCalledWith({
                where: { archivoId: 1 },
            });
        });
    });

    describe('softDelete', () => {
        it('sets activo to false and returns updated archivo', async () => {
            const deleted = { id: 1, activo: false };
            mockArchivoDelegate.update.mockResolvedValue(deleted);

            await expect(repository.softDelete(1)).resolves.toEqual(deleted);
            expect(mockArchivoDelegate.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { activo: false },
            });
        });
    });

    describe('findById', () => {
        it('returns archivo when found', async () => {
            const row = { id: 1, storageKey: 'key-1', activo: true };
            mockArchivoDelegate.findUnique.mockResolvedValue(row);

            const result = await repository.findById(1);
            expect(result).toEqual(row);
        });

        it('returns null when not found', async () => {
            mockArchivoDelegate.findUnique.mockResolvedValue(null);
            const result = await repository.findById(999);
            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('creates an archivo row', async () => {
            const input = {
                storageKey: 'key-1',
                mimeType: 'application/pdf',
                extension: 'pdf',
                bytes: 2048,
                originalName: 'test.pdf',
                tipo: 'DDJJ' as const,
                subidoPorId: 'user-1',
            };
            const created = { id: 2, ...input, activo: true, periodo: null, creadoEn: new Date() };
            mockArchivoDelegate.create.mockResolvedValue(created);

            const result = await repository.create(input);
            expect(result).toEqual(created);
            expect(mockArchivoDelegate.create).toHaveBeenCalledWith({ data: input });
        });
    });

    describe('existsById', () => {
        it('returns true when row exists', async () => {
            mockArchivoDelegate.findUnique.mockResolvedValue({ id: 1 });
            const result = await repository.existsById(1);
            expect(result).toBe(true);
        });

        it('returns false when row does not exist', async () => {
            mockArchivoDelegate.findUnique.mockResolvedValue(null);
            const result = await repository.existsById(999);
            expect(result).toBe(false);
        });
    });
});
