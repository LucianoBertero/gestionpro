import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { EmailTemplatesController } from './controllers/email-templates.controller';
import { EmailTemplateService } from './services/email-templates.service';

@Module({
    imports: [DatabaseModule],
    controllers: [EmailTemplatesController],
    providers: [EmailTemplateService],
    exports: [EmailTemplateService],
})
export class EmailTemplatesModule {}
