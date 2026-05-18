import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DocumentsService } from './documents.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../schemas/user.schema';
import { DocEntityType } from '../schemas/document.schema';

// --- Driver document endpoints ---
@ApiTags('Driver - Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.DRIVER)
@Controller('driver/documents')
export class DriverDocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'List my documents' })
  findMyDocuments(@CurrentUser('_id') userId: string) {
    // Driver's entityId is their userId for now
    return this.documentsService.findByEntity(DocEntityType.DRIVER, userId);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a document' })
  create(
    @CurrentUser('_id') userId: string,
    @Body()
    body: {
      docType: string;
      fileUrl: string;
      fileName?: string;
      expiryDate?: string;
      documentNumber?: string;
    },
  ) {
    return this.documentsService.create({
      entityType: DocEntityType.DRIVER,
      entityId: userId,
      ...body,
    });
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a document' })
  update(
    @Param('id') id: string,
    @Body()
    body: {
      fileUrl?: string;
      fileName?: string;
      expiryDate?: string;
      documentNumber?: string;
    },
  ) {
    return this.documentsService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}

// --- Admin document endpoints ---
@ApiTags('Admin - Documents')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'), RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/documents')
export class AdminDocumentsController {
  constructor(private documentsService: DocumentsService) {}

  @Get('pending')
  @ApiOperation({ summary: 'List pending documents' })
  getPending(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('entityType') entityType?: string,
  ) {
    return this.documentsService.getPendingDocuments({
      page: page ? parseInt(page) : undefined,
      limit: limit ? parseInt(limit) : undefined,
      entityType,
    });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Document verification stats' })
  getStats() {
    return this.documentsService.getDocumentStats();
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Documents expiring soon' })
  getExpiring(@Query('days') days?: string) {
    return this.documentsService.getExpiringDocuments(
      days ? parseInt(days) : 30,
    );
  }

  @Get('entity/:entityType/:entityId')
  @ApiOperation({ summary: 'Get documents for a specific entity' })
  getByEntity(
    @Param('entityType') entityType: DocEntityType,
    @Param('entityId') entityId: string,
  ) {
    return this.documentsService.findByEntity(entityType, entityId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  getById(@Param('id') id: string) {
    return this.documentsService.findById(id);
  }

  @Put(':id/verify')
  @ApiOperation({ summary: 'Verify a document' })
  verify(
    @CurrentUser('_id') adminId: string,
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    return this.documentsService.verify(id, adminId, notes);
  }

  @Put(':id/reject')
  @ApiOperation({ summary: 'Reject a document' })
  reject(
    @CurrentUser('_id') adminId: string,
    @Param('id') id: string,
    @Body('reason') reason: string,
  ) {
    return this.documentsService.reject(id, adminId, reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a document' })
  delete(@Param('id') id: string) {
    return this.documentsService.delete(id);
  }
}
