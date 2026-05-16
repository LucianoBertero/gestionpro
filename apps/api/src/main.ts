import 'reflect-metadata';

import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import * as Sentry from '@sentry/node';
import { useContainer } from 'class-validator';
import compression from 'compression';
import { type NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app/app.module';
import { APP_ENVIRONMENT } from './app/enums/app.enum';
import { createSwaggerDocument, setupSwaggerUI } from './swagger';

if (process.env.SENTRY_DSN) {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.APP_ENV,
        tracesSampleRate: 1,
    });
}

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, { bufferLogs: true });

    const config = app.get(ConfigService);
    const logger = app.get(Logger);
    const env = config.get('app.env');
    const host = config.getOrThrow<string>('app.http.host');
    const port = config.getOrThrow<number>('app.http.port');

    app.use((req: Request, res: Response, next: NextFunction) => {
        if (req.path === '/favicon.ico') return res.sendStatus(204);
        next();
    });
    app.use(helmet());
    app.use(compression());
    app.useLogger(logger);
    app.enableCors(config.get('app.cors'));

    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        })
    );

    app.enableVersioning({
        type: VersioningType.URI,
        defaultVersion: '1',
    });

    useContainer(app.select(AppModule), { fallbackOnErrors: true });

    const swaggerDocument = createSwaggerDocument(app);

    // Always serve raw OpenAPI JSON for code generation
    app.getHttpAdapter().get('/docs-json', (_req: Request, res: Response) => {
        res.json(swaggerDocument);
    });

    if (env !== APP_ENVIRONMENT.PRODUCTION) {
        setupSwaggerUI(app, swaggerDocument);
    }

    app.enableShutdownHooks();

    await app.listen(port, host);
    logger.log(`Server running on: ${await app.getUrl()}`);
}

bootstrap().catch(err => {
    console.error('Server failed to start:', err);
    process.exit(1);
});
