import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HealthIndicatorResult } from '@nestjs/terminus';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { type PoolConfig, Pool } from 'pg';

@Injectable()
export class DatabaseService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
{
    private readonly pool: Pool;

    constructor(configService: ConfigService) {
        const rawUrl = configService.getOrThrow<string>('DATABASE_URL');
        const parsed = new URL(rawUrl);

        const poolConfig: PoolConfig = {
            user: decodeURIComponent(parsed.username),
            password: decodeURIComponent(parsed.password),
            host: parsed.hostname,
            port: parseInt(parsed.port, 10),
            database: parsed.pathname.slice(1),
            ssl: { rejectUnauthorized: false },
        };

        // eslint-disable-next-line no-console
        console.debug(
            `[DatabaseService] connecting to ${poolConfig.host}:${poolConfig.port} as ${poolConfig.user}`
        );

        const pool = new Pool(poolConfig);
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
        return { prisma: { status: 'up' } };
    }
}
