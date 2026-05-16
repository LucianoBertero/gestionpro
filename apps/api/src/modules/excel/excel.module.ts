import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/common/database/database.module';
import { ExcelExportController } from './controllers/excel-export.controller';
import { ExcelImportController } from './controllers/excel-import.controller';
import { ExcelService } from './services/excel.service';

@Module({
    imports: [DatabaseModule],
    controllers: [ExcelImportController, ExcelExportController],
    providers: [ExcelService],
})
export class ExcelModule {}
