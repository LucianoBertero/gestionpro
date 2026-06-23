
import { FileValidationPipe } from 'src/modules/archivos/pipes/file-validation.pipe';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fileType = require('file-type');

jest.mock('file-type', () => ({
    fileTypeFromBuffer: jest.fn(),
}));

type MockFile = Express.Multer.File;

function makeFile(overrides: Partial<MockFile> = {}): MockFile {
    return {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        buffer: Buffer.from('fake-pdf-content'),
        size: 1024,
        ...overrides,
    } as MockFile;
}

describe('FileValidationPipe', () => {
    let pipe: FileValidationPipe;

    beforeEach(() => {
        pipe = new FileValidationPipe();
    });

    describe('size validation', () => {
        it('rejects files larger than 10 MB with archivo.error.fileTooLarge', async () => {
            const largeFile = makeFile({ size: 11 * 1024 * 1024 }); // 11 MB

            await expect(
                pipe.transform(largeFile, { type: 'custom' })
            ).rejects.toMatchObject({
                message: 'archivo.error.fileTooLarge',
            });
        });
    });

    describe('MIME allowlist', () => {
        it('rejects application/zip with archivo.error.unsupportedMimeType', async () => {
            const zipFile = makeFile({ mimetype: 'application/zip' });

            await expect(
                pipe.transform(zipFile, { type: 'custom' })
            ).rejects.toMatchObject({
                message: 'archivo.error.unsupportedMimeType',
            });
        });
    });

    describe('magic byte validation', () => {
        it('rejects file when magic bytes do not match declared MIME', async () => {
            // Declared as PNG but magic bytes indicate PDF
            const mismatchedFile = makeFile({
                mimetype: 'image/png',
                buffer: Buffer.from('%PDF-1.4 fake pdf content'),
            });
            (fileType.fileTypeFromBuffer as jest.Mock).mockResolvedValue({
                mime: 'application/pdf',
                ext: 'pdf',
            });

            await expect(
                pipe.transform(mismatchedFile, { type: 'custom' })
            ).rejects.toMatchObject({
                message: 'archivo.error.invalidFile',
            });
        });
    });

    describe('happy path', () => {
        it('returns the file unchanged when all validations pass', async () => {
            const validFile = makeFile({
                mimetype: 'application/pdf',
                buffer: Buffer.from('%PDF-1.4 valid pdf'),
                size: 5 * 1024 * 1024, // 5 MB
            });
            (fileType.fileTypeFromBuffer as jest.Mock).mockResolvedValue({
                mime: 'application/pdf',
                ext: 'pdf',
            });

            const result = await pipe.transform(validFile, {
                type: 'custom',
            });

            expect(result).toBe(validFile);
        });
    });
});
