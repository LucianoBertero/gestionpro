import type { RefreshToken } from '@prisma/client';

export type RefreshTokenEntity = RefreshToken;

export interface CreateRefreshTokenInput {
    usuarioId: string;
    token: string;
    expira: Date;
}
