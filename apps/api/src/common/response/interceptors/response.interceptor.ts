import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClassConstructor } from 'class-transformer';
import { Observable, map } from 'rxjs';

import {
    DOC_RESPONSE_MESSAGE_META_KEY,
    DOC_RESPONSE_PAGINATED_META_KEY,
    DOC_RESPONSE_SERIALIZATION_META_KEY,
} from 'src/common/doc/constants/doc.constant';
import { MessageService } from 'src/common/message/services/message.service';

import { ResponseSerializerService } from '../services/response.serializer.service';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
    constructor(
        private readonly reflector: Reflector,
        private readonly messageService: MessageService,
        private readonly serializerService: ResponseSerializerService
    ) {}

    intercept(
        context: ExecutionContext,
        next: CallHandler
    ): Observable<unknown> {
        return next.handle().pipe(
            map(responseBody => {
                const ctx = context.switchToHttp();
                const statusCode: number = ctx.getResponse<{
                    statusCode: number;
                }>().statusCode;

                const cls: ClassConstructor<unknown> = this.reflector.get(
                    DOC_RESPONSE_SERIALIZATION_META_KEY,
                    context.getHandler()
                );
                const messageKey: string | undefined = this.reflector.get(
                    DOC_RESPONSE_MESSAGE_META_KEY,
                    context.getHandler()
                );
                const isPaginated: boolean =
                    this.reflector.get(
                        DOC_RESPONSE_PAGINATED_META_KEY,
                        context.getHandler()
                    ) ?? false;

                // If the handler returned the paginated envelope
                // { data: T[], total, skip, take }, unwrap it and put the
                // pagination metadata under `meta` on the final response.
                if (isPaginated && this.isPaginatedEnvelope(responseBody)) {
                    const { data: rows, total, skip, take } = responseBody;
                    return {
                        statusCode,
                        message: this.messageService.resolveSuccessMessage(messageKey, statusCode),
                        timestamp: new Date().toISOString(),
                        data: this.serializerService.serialize(rows, cls),
                        meta: { total, skip, take },
                    };
                }

                const data = this.serializerService.serialize(
                    responseBody,
                    cls
                );
                this.serializerService.patchGenericMessage(data, cls);
                const message = this.messageService.resolveSuccessMessage(
                    messageKey,
                    statusCode
                );

                return {
                    statusCode,
                    message,
                    timestamp: new Date().toISOString(),
                    data,
                };
            })
        );
    }

    private isPaginatedEnvelope(value: unknown): value is { data: unknown; total: number; skip: number; take: number } {
        return (
            typeof value === 'object' &&
            value !== null &&
            'data' in value &&
            'total' in value &&
            'skip' in value &&
            'take' in value
        );
    }
}
