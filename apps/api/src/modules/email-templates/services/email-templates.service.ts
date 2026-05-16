import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { EmailTemplateRepository } from 'src/common/database/repositories/email-template.repository';
import { ApiGenericResponseDto } from 'src/common/response/dtos/response.generic.dto';

@Injectable()
export class EmailTemplateService {
    private readonly logger = new Logger(EmailTemplateService.name);
    constructor(private readonly repo: EmailTemplateRepository) {}

    findAll() { return this.repo.findAll(); }

    async findById(id: number) {
        const t = await this.repo.findById(id);
        if (!t) throw new HttpException('emailTemplates.error.notFound', HttpStatus.NOT_FOUND);
        return t;
    }

    create(data: any) { return this.repo.create(data); }
    update(id: number, data: any) { return this.repo.update(id, data); }

    async softDelete(id: number): Promise<ApiGenericResponseDto> {
        await this.repo.softDelete(id);
        return { success: true, message: 'emailTemplates.success.deleted' };
    }
}
