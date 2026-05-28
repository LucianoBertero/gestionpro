import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';

@Injectable()
export class DatabaseService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly pool: Pool;

    constructor(configService: ConfigService) {
        // Prefer DIRECT_URL (direct Postgres) when available — useful when DATABASE_URL
        // points to a pgbouncer pooler which may cause auth differences.
        const rawUrl =
            configService.get<string>('DIRECT_URL') ||
            configService.getOrThrow<string>('DATABASE_URL');

        // Mask password for safe logging (keep first/last char if possible)
        const masked = (() => {
            try {
                const url = new URL(rawUrl);
                if (url.password) {
                    const pwd = decodeURIComponent(url.password);
                    const visible = pwd.length > 2 ? `${pwd[0]}***${pwd[pwd.length - 1]}` : '***';
                    url.password = visible;
                }
                return url.toString();
            } catch {
                return '<invalid-connection-string>';
            }
        })();

        // eslint-disable-next-line no-console
        console.debug(`[DatabaseService] connecting using: ${masked}`);

        const pool = new Pool({ connectionString: rawUrl });
        super({ adapter: new PrismaPg(pool) });
        this.pool = pool;
    }

    async onModuleInit() {
        await this.$connect();
    }

    async onModuleDestroy() {
        await this.$disconnect();
        await this.pool.end();
    }

    async isHealthy(): Promise<HealthIndicatorResult> {
        try {
            await this.pool.query('SELECT 1');
            return { prisma: { status: 'up' } };
        } catch {
            return { prisma: { status: 'down' } };
        }
    }
}
