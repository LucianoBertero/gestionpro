import type { IncomingMessage, ServerResponse } from 'node:http';

import type { ConfigService } from '@nestjs/config';
import type { Params } from 'nestjs-pino';

import { APP_ENVIRONMENT } from 'src/app/enums/app.enum';

type AuthenticatedRequest = IncomingMessage & {
    id?: string | number;
    body?: unknown;
    user?: { userId?: string };
};

type TrackedError = Error & {
    code?: string;
    statusCode?: number;
};

const SENSITIVE_PATHS = [
    'req.headers.authorization',
    'req.headers.cookie',
    'req.headers["x-api-key"]',
    'req.body.password',
    'req.body.confirmPassword',
    'req.body.currentPassword',
    'req.body.newPassword',
    'req.body.token',
    'req.body.refreshToken',
    'req.body.accessToken',
    'req.body.secret',
    'req.body.apiKey',
    'req.body.cardNumber',
    'req.body.cvv',
    'req.body.ssn',
    'res.headers["set-cookie"]',
];

const ANSI = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    red: '\x1b[31m',
    magenta: '\x1b[35m',
};

const colorize = (enabled: boolean, text: string, color: string): string =>
    enabled ? `${color}${text}${ANSI.reset}` : text;

const colorMethod = (enabled: boolean, method?: string): string => {
    const value = method ?? 'UNKNOWN';
    switch (value) {
        case 'GET':
            return colorize(enabled, value, `${ANSI.bold}${ANSI.blue}`);
        case 'POST':
            return colorize(enabled, value, `${ANSI.bold}${ANSI.green}`);
        case 'PUT':
        case 'PATCH':
            return colorize(enabled, value, `${ANSI.bold}${ANSI.yellow}`);
        case 'DELETE':
            return colorize(enabled, value, `${ANSI.bold}${ANSI.red}`);
        default:
            return colorize(enabled, value, `${ANSI.bold}${ANSI.magenta}`);
    }
};

const colorStatus = (enabled: boolean, statusCode: number): string => {
    if (statusCode >= 500) {
        return colorize(enabled, statusCode.toString(), `${ANSI.bold}${ANSI.red}`);
    }
    if (statusCode >= 400) {
        return colorize(enabled, statusCode.toString(), `${ANSI.bold}${ANSI.yellow}`);
    }
    if (statusCode >= 300) {
        return colorize(enabled, statusCode.toString(), `${ANSI.bold}${ANSI.cyan}`);
    }
    return colorize(enabled, statusCode.toString(), `${ANSI.bold}${ANSI.green}`);
};

export const createLoggerConfig = (configService: ConfigService): Params => {
    const env = configService.get<string>('app.env', APP_ENVIRONMENT.LOCAL);
    const isPrettyEnv =
        env === APP_ENVIRONMENT.LOCAL ||
        env === APP_ENVIRONMENT.DEVELOPMENT;
    const logLevel = configService.get<string>('app.logLevel', 'info');

    return {
        pinoHttp: {
            level: logLevel,

            transport: isPrettyEnv
                ? {
                      target: 'pino-pretty',
                      options: {
                          colorize: true,
                          levelFirst: true,
                          translateTime: 'yyyy-mm-dd HH:MM:ss.l',
                          ignore: 'pid,hostname,service,version,environment,req,res,responseTime',
                          singleLine: true,
                          messageFormat: '[{context}] {msg}',
                      },
                  }
                : undefined,

            formatters: {
                level: (label: string) => ({ level: label.toUpperCase() }),
                bindings: () => ({}),
            },

            timestamp: () => `,"timestamp":"${new Date().toISOString()}"`,
            messageKey: 'message',

            base: {
                service: configService.get<string>('app.name', 'nestjs-app'),
                version: configService.get<string>(
                    'app.versioning.version',
                    '1'
                ),
                environment: env,
            },

            redact: {
                paths: SENSITIVE_PATHS,
                remove: true,
            },

            // Carries correlationId and traceId on every HTTP log line.
            // customProps fires on response-finish so req.user is populated by then.
            customProps: (req: IncomingMessage) => {
                const r = req as AuthenticatedRequest;
                return {
                    correlationId: r.id,
                    traceId:
                        r.headers['x-trace-id']?.toString() ??
                        r.headers['x-b3-traceid']?.toString() ??
                        r.headers['traceparent']?.toString().split('-')[1],
                    userId: r.user?.userId,
                };
            },

            serializers: {
                req: (req: AuthenticatedRequest) => ({
                    id: req.id,
                    method: req.method,
                    url: req.url,
                    path: req.url?.split('?')[0],
                    userAgent: req.headers?.['user-agent'],
                    ip:
                        req.headers?.['x-forwarded-for']
                            ?.toString()
                            .split(',')[0]
                            .trim() ?? req.socket?.remoteAddress,
                    contentLength: req.headers?.['content-length'],
                    contentType: req.headers?.['content-type'],
                }),
                res: (res: ServerResponse) => ({
                    statusCode: res.statusCode,
                }),
                err: (err: TrackedError) => ({
                    type: err.name,
                    code: err.code,
                    message: err.message,
                    stack: err.stack,
                }),
            },

            customLogLevel: (
                _req: IncomingMessage,
                res: ServerResponse,
                err?: Error
            ) => {
                if (err || res.statusCode >= 500) return 'error';
                if (res.statusCode >= 400) return 'warn';
                return 'info';
            },

            customSuccessMessage: (
                req: IncomingMessage,
                res: ServerResponse,
                responseTime: number
            ) => {
                const method = colorMethod(isPrettyEnv, req.method);
                const statusCode = colorStatus(isPrettyEnv, res.statusCode);
                const duration = colorize(
                    isPrettyEnv,
                    `${responseTime}ms`,
                    `${ANSI.dim}${ANSI.cyan}`
                );
                return `<-- ${method} ${req.url} ${statusCode} ${duration}`;
            },

            customReceivedMessage: (req: IncomingMessage) =>
                `--> ${colorMethod(isPrettyEnv, req.method)} ${req.url}`,

            customErrorMessage: (
                req: IncomingMessage,
                res: ServerResponse,
                err: Error
            ) => {
                const method = colorMethod(isPrettyEnv, req.method);
                const statusCode = colorStatus(isPrettyEnv, res.statusCode);
                const errorMessage = colorize(
                    isPrettyEnv,
                    err.message,
                    `${ANSI.bold}${ANSI.red}`
                );
                return `<-- ${method} ${req.url} ${statusCode} ${errorMessage}`;
            },

            genReqId: (req: IncomingMessage) => {
                const r = req as AuthenticatedRequest;
                return (
                    r.id ??
                    r.headers['x-request-id']?.toString() ??
                    r.headers['x-correlation-id']?.toString() ??
                    crypto.randomUUID()
                );
            },
        },

        exclude: ['/health', '/health/live', '/health/ready', '/favicon.ico'],
    };
};
