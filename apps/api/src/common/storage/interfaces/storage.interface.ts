/**
 * Input for the put operation.
 * The key is pre-computed by the caller following the convention:
 * estudios/{estudioId}/{parentType}/{parentId}/{periodo}/{uuid}.{ext}
 */
export interface PutObjectInput {
    key: string;
    body: Buffer;
    contentType: string;
    metadata?: Record<string, string>;
}

/**
 * Abstract contract for object storage operations.
 * Feature modules depend on this abstraction, not on the R2 implementation.
 * Inject via the STORAGE_SERVICE token.
 */
export abstract class StorageService {
    /**
     * Upload a file to object storage.
     * @returns The storage key on success.
     * @throws On network or service errors.
     */
    abstract put(input: PutObjectInput): Promise<{ key: string }>;

    /**
     * Retrieve a file from object storage.
     * @returns The file contents as a Buffer.
     * @throws If the key does not exist or on network errors.
     */
    abstract get(key: string): Promise<Buffer>;

    /**
     * Generate a time-limited signed URL for reading a file.
     * v1 always uses signed URLs (no public bucket) because files may
     * contain sensitive PII.
     * @param key The storage key.
     * @param expiresInSec TTL in seconds. Default 300 (5 minutes).
     * @returns A signed URL string.
     */
    abstract getSignedUrl(key: string, expiresInSec?: number): Promise<string>;

    /**
     * Remove a file from object storage.
     * MUST be idempotent — deleting a non-existent key is a no-op.
     */
    abstract delete(key: string): Promise<void>;

    /**
     * Check whether a file exists in object storage.
     */
    abstract exists(key: string): Promise<boolean>;
}
