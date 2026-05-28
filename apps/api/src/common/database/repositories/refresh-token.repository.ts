import { Injectable } from '@nestjs/common';

import type { RefreshTokenEntity } from 'src/common/database/interfaces/refresh-token.interface';

import { DatabaseService } from '../services/database.service';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly db: DatabaseService) {}

    create(
        usuarioId: string,
        token: string,
        expira: Date
    ): Promise<RefreshTokenEntity> {
        return this.db.refreshToken.create({
            data: { usuarioId, token, expira },
        });
    }

    findByToken(token: string): Promise<RefreshTokenEntity | null> {
        return this.db.refreshToken.findUnique({ where: { token } });
    }

    async revoke(token: string): Promise<void> {
        await this.db.refreshToken.update({
            where: { token },
            data: { revocado: true },
        });
    }

    async revokeAll(usuarioId: string): Promise<void> {
        await this.db.refreshToken.updateMany({
            where: { usuarioId, revocado: false },
            data: { revocado: true },
        });
    }

    async deleteExpired(): Promise<number> {
        const result = await this.db.refreshToken.deleteMany({
            where: { expira: { lt: new Date() } },
        });
        return result.count;
    }

    /**
     * Deletes revoked tokens older than `daysOld` days.
     * Keeps recently revoked tokens for audit/debugging purposes.
     */
    async deleteRevokedOld(daysOld = 30): Promise<number> {
        const cutoff = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
        const result = await this.db.refreshToken.deleteMany({
            where: {
                revocado: true,
                creadoEn: { lt: cutoff },
            },
        });
        return result.count;
    }
}
