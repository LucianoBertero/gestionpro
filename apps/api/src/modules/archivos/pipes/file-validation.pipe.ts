import {
    BadRequestException,
    Injectable,
    type ArgumentMetadata,
    type PipeTransform,
} from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Allowed MIME types for file uploads.
 * Includes PDF, images (PNG/JPEG), and common office formats.
 */
const ALLOWED_MIMES = [
    'application/pdf',
    'image/png',
    'image/jpeg',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * 3-step validation pipeline for file uploads.
 *
 * 1. Size check — rejects files larger than 10 MB.
 * 2. MIME allowlist — rejects files whose declared MIME type is not in the allowlist.
 * 3. Magic-byte verification — reads the first bytes via file-type and rejects
 *    files whose magic bytes do not match the declared MIME type.
 *
 * Throws BadRequestException with i18n keys:
 * - archivo.error.fileTooLarge
 * - archivo.error.unsupportedMimeType
 * - archivo.error.invalidFile
 */
@Injectable()
export class FileValidationPipe
    implements PipeTransform<Express.Multer.File, Express.Multer.File>
{
    async transform(
        file: Express.Multer.File,
        _metadata: ArgumentMetadata,
    ): Promise<Express.Multer.File> {
        // Step 1: Size
        if (file.size > MAX_FILE_SIZE) {
            throw new BadRequestException('archivo.error.fileTooLarge');
        }

        // Step 2: Declared MIME type
        if (!ALLOWED_MIMES.includes(file.mimetype)) {
            throw new BadRequestException(
                'archivo.error.unsupportedMimeType',
            );
        }

        // Step 3: Magic-byte verification
        const detected = await fileTypeFromBuffer(file.buffer);
        if (detected?.mime !== file.mimetype) {
            throw new BadRequestException('archivo.error.invalidFile');
        }

        return file;
    }
}
