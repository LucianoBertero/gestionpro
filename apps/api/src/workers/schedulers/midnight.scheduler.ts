import { Injectable, Logger, Scope } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { RefreshTokenRepository } from 'src/common/database/repositories/refresh-token.repository';

@Injectable({ scope: Scope.DEFAULT })
export class MidNightScheduleWorker {
    private readonly logger = new Logger(MidNightScheduleWorker.name);

    constructor(private readonly refreshTokenRepo: RefreshTokenRepository) {}

    /**
     * Runs daily at midnight.
     * Cleans up expired refresh tokens and revoked tokens older than 30 days.
     */
    @Cron('0 0 * * *')
    async handleCron() {
        this.logger.log('Midnight cleanup started');

        const expired = await this.refreshTokenRepo.deleteExpired();
        if (expired > 0) {
            this.logger.log(`Deleted ${expired} expired refresh tokens`);
        }

        const revokedOld = await this.refreshTokenRepo.deleteRevokedOld(30);
        if (revokedOld > 0) {
            this.logger.log(`Deleted ${revokedOld} revoked refresh tokens older than 30 days`);
        }

        this.logger.log('Midnight cleanup finished');
    }
}
