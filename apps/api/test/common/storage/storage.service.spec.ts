import { StorageService } from 'src/common/storage/interfaces/storage.interface';

/**
 * Contract test for the StorageService abstract class.
 * Verifies that the abstract class has the correct shape and that
 * concrete implementations must provide all five operations.
 */
class FakeStorageService extends StorageService {
    put = jest.fn();
    get = jest.fn();
    getSignedUrl = jest.fn();
    delete = jest.fn();
    exists = jest.fn();
}

describe('StorageService (contract)', () => {
    let service: FakeStorageService;

    beforeEach(() => {
        service = new FakeStorageService();
    });

    it('should define the put method', () => {
        expect(service.put).toBeDefined();
        expect(typeof service.put).toBe('function');
    });

    it('should define the get method', () => {
        expect(service.get).toBeDefined();
        expect(typeof service.get).toBe('function');
    });

    it('should define the getSignedUrl method', () => {
        expect(service.getSignedUrl).toBeDefined();
        expect(typeof service.getSignedUrl).toBe('function');
    });

    it('should define the delete method', () => {
        expect(service.delete).toBeDefined();
        expect(typeof service.delete).toBe('function');
    });

    it('should define the exists method', () => {
        expect(service.exists).toBeDefined();
        expect(typeof service.exists).toBe('function');
    });

    it('should extend from StorageService abstract class', () => {
        expect(service).toBeInstanceOf(StorageService);
    });

    describe('put contract', () => {
        it('should delegate to the implementation', async () => {
            const input = {
                key: 'test/key.pdf',
                body: Buffer.from('content'),
                contentType: 'application/pdf',
            };
            service.put.mockResolvedValue({ key: 'test/key.pdf' });

            const result = await service.put(input);

            expect(result).toEqual({ key: 'test/key.pdf' });
            expect(service.put).toHaveBeenCalledWith(input);
        });
    });

    describe('get contract', () => {
        it('should delegate to the implementation', async () => {
            const content = Buffer.from('file-content');
            service.get.mockResolvedValue(content);

            const result = await service.get('test/key.pdf');

            expect(result).toEqual(content);
            expect(service.get).toHaveBeenCalledWith('test/key.pdf');
        });
    });

    describe('getSignedUrl contract', () => {
        it('should delegate to the implementation with default TTL', async () => {
            service.getSignedUrl.mockResolvedValue('https://signed.example.com');

            const result = await service.getSignedUrl('test/key.pdf');

            expect(result).toBe('https://signed.example.com');
            expect(service.getSignedUrl).toHaveBeenCalledWith('test/key.pdf');
        });

        it('should delegate to the implementation with custom TTL', async () => {
            service.getSignedUrl.mockResolvedValue('https://signed.example.com');

            const result = await service.getSignedUrl('test/key.pdf', 600);

            expect(result).toBe('https://signed.example.com');
            expect(service.getSignedUrl).toHaveBeenCalledWith(
                'test/key.pdf',
                600,
            );
        });
    });

    describe('delete contract', () => {
        it('should delegate to the implementation', async () => {
            service.delete.mockResolvedValue(undefined);

            await service.delete('test/key.pdf');

            expect(service.delete).toHaveBeenCalledWith('test/key.pdf');
        });
    });

    describe('exists contract', () => {
        it('should delegate to the implementation and return true', async () => {
            service.exists.mockResolvedValue(true);

            const result = await service.exists('test/key.pdf');

            expect(result).toBe(true);
            expect(service.exists).toHaveBeenCalledWith('test/key.pdf');
        });

        it('should delegate to the implementation and return false', async () => {
            service.exists.mockResolvedValue(false);

            const result = await service.exists('test/missing.pdf');

            expect(result).toBe(false);
            expect(service.exists).toHaveBeenCalledWith('test/missing.pdf');
        });
    });
});
