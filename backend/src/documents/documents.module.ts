import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import {
  VerificationDocument,
  VerificationDocumentSchema,
} from '../schemas/document.schema';
import { Driver, DriverSchema } from '../schemas/driver.schema';
import { DocumentsService } from './documents.service';
import {
  DriverDocumentsController,
  AdminDocumentsController,
} from './documents.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([
      { name: VerificationDocument.name, schema: VerificationDocumentSchema },
      { name: Driver.name, schema: DriverSchema },
    ]),
  ],
  controllers: [DriverDocumentsController, AdminDocumentsController],
  providers: [DocumentsService],
  exports: [DocumentsService],
})
export class DocumentsModule {}
