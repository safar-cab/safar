import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  VerificationDocument,
  DocumentDocument,
  DocEntityType,
  DocStatus,
} from '../schemas/document.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { Driver, DriverDocument } from '../schemas/driver.schema';
import { Car, CarDocument } from '../schemas/car.schema';
import { User, UserDocument } from '../schemas/user.schema';
import { NotificationType } from '../schemas/notification.schema';

@Injectable()
export class DocumentsService {
  private readonly logger = new Logger(DocumentsService.name);

  constructor(
    @InjectModel(VerificationDocument.name)
    private documentModel: Model<DocumentDocument>,
    @InjectModel(Driver.name)
    private driverModel: Model<DriverDocument>,
    @InjectModel(Car.name)
    private carModel: Model<CarDocument>,
    @InjectModel(User.name)
    private userModel: Model<UserDocument>,
    private notificationsService: NotificationsService,
  ) {}

  async create(data: {
    entityType: DocEntityType;
    entityId: string;
    docType: string;
    fileUrl: string;
    fileName?: string;
    expiryDate?: string;
    documentNumber?: string;
    notes?: string;
  }) {
    const doc = await this.documentModel.create({
      entityType: data.entityType,
      entityId: new Types.ObjectId(data.entityId),
      docType: data.docType as any,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      documentNumber: data.documentNumber,
      notes: data.notes,
      status: DocStatus.PENDING,
    });

    this.logger.log(
      `Document created: ${data.docType} for ${data.entityType}/${data.entityId}`,
    );
    return doc;
  }

  async findByEntity(entityType: DocEntityType, entityId: string) {
    return this.documentModel
      .find({
        entityType,
        entityId: new Types.ObjectId(entityId),
      })
      .sort({ createdAt: -1 })
      .lean();
  }

  async findById(id: string) {
    const doc = await this.documentModel.findById(id).lean();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(
    id: string,
    data: {
      fileUrl?: string;
      fileName?: string;
      expiryDate?: string;
      documentNumber?: string;
      notes?: string;
    },
  ) {
    const update: Record<string, unknown> = { status: DocStatus.PENDING };
    if (data.fileUrl) update.fileUrl = data.fileUrl;
    if (data.fileName) update.fileName = data.fileName;
    if (data.expiryDate) update.expiryDate = new Date(data.expiryDate);
    if (data.documentNumber) update.documentNumber = data.documentNumber;
    if (data.notes !== undefined) update.notes = data.notes;

    const doc = await this.documentModel
      .findByIdAndUpdate(id, update, { new: true })
      .lean();
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async delete(id: string) {
    const doc = await this.documentModel.findByIdAndDelete(id);
    if (!doc) throw new NotFoundException('Document not found');
    return { deleted: true };
  }

  // --- Admin verification ---

  async verify(id: string, adminId: string, notes?: string) {
    const doc = await this.documentModel.findByIdAndUpdate(
      id,
      {
        status: DocStatus.VERIFIED,
        verifiedBy: new Types.ObjectId(adminId),
        verifiedAt: new Date(),
        notes,
        rejectionReason: null,
      },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');

    this.logger.log(`Document ${id} verified by admin ${adminId}`);
    await this.notifyDocumentStatusChange(doc, 'verified');
    return doc;
  }

  async reject(id: string, adminId: string, reason: string) {
    if (!reason) throw new BadRequestException('Rejection reason required');

    const doc = await this.documentModel.findByIdAndUpdate(
      id,
      {
        status: DocStatus.REJECTED,
        verifiedBy: new Types.ObjectId(adminId),
        verifiedAt: new Date(),
        rejectionReason: reason,
      },
      { new: true },
    );
    if (!doc) throw new NotFoundException('Document not found');

    this.logger.log(`Document ${id} rejected by admin ${adminId}: ${reason}`);
    await this.notifyDocumentStatusChange(doc, 'rejected');
    return doc;
  }

  async getPendingDocuments(query: {
    page?: number;
    limit?: number;
    entityType?: string;
  }) {
    const { page = 1, limit = 20, entityType } = query;
    const filter: Record<string, unknown> = { status: DocStatus.PENDING };
    if (entityType) filter.entityType = entityType;

    const [documents, total] = await Promise.all([
      this.documentModel
        .find(filter)
        .sort({ createdAt: 1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      this.documentModel.countDocuments(filter),
    ]);

    // Enrich with parent entity details
    const enriched = await Promise.all(
      documents.map(async (doc) => {
        let entityInfo: { name: string; phone?: string; detail?: string } | null = null;
        if (doc.entityType === DocEntityType.DRIVER) {
          const driver = await this.driverModel
            .findById(doc.entityId)
            .select('userId licenseNumber')
            .lean();
          if (driver) {
            const user = await this.userModel
              .findById(driver.userId)
              .select('name phone')
              .lean();
            entityInfo = {
              name: user?.name || 'Unknown Driver',
              phone: user?.phone,
              detail: `License: ${driver.licenseNumber || 'N/A'}`,
            };
          }
        } else if (doc.entityType === DocEntityType.CAR) {
          const car = await this.carModel
            .findById(doc.entityId)
            .select('make model registrationNumber')
            .lean();
          if (car) {
            entityInfo = {
              name: `${car.make} ${car.model}`,
              detail: car.registrationNumber || 'N/A',
            };
          }
        }
        return { ...doc, entityInfo };
      }),
    );

    return { documents: enriched, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getDocumentStats() {
    const [pending, verified, rejected, expired] = await Promise.all([
      this.documentModel.countDocuments({ status: DocStatus.PENDING }),
      this.documentModel.countDocuments({ status: DocStatus.VERIFIED }),
      this.documentModel.countDocuments({ status: DocStatus.REJECTED }),
      this.documentModel.countDocuments({ status: DocStatus.EXPIRED }),
    ]);
    return {
      pending,
      verified,
      rejected,
      expired,
      total: pending + verified + rejected + expired,
    };
  }

  // --- Expiry tracking ---

  async getExpiringDocuments(days: number = 30) {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);

    return this.documentModel
      .find({
        status: DocStatus.VERIFIED,
        expiryDate: { $gte: now, $lte: futureDate },
      })
      .sort({ expiryDate: 1 })
      .lean();
  }

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleExpiredDocuments() {
    const now = new Date();

    const result = await this.documentModel.updateMany(
      {
        status: DocStatus.VERIFIED,
        expiryDate: { $lt: now },
      },
      { status: DocStatus.EXPIRED },
    );

    if (result.modifiedCount > 0) {
      this.logger.warn(`${result.modifiedCount} documents marked as expired`);
    }

    // Notify about documents expiring in 7 days
    const sevenDays = new Date();
    sevenDays.setDate(now.getDate() + 7);

    const expiringSoon = await this.documentModel
      .find({
        status: DocStatus.VERIFIED,
        expiryDate: { $gte: now, $lte: sevenDays },
        entityType: DocEntityType.DRIVER,
      })
      .lean();

    for (const doc of expiringSoon) {
      const driver = await this.driverModel
        .findById(doc.entityId)
        .select('userId')
        .lean();
      if (driver?.userId) {
        const daysLeft = Math.ceil(
          (doc.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
        );
        this.notificationsService.notify({
          userId: driver.userId.toString(),
          title: 'Document Expiring Soon',
          body: `Your ${doc.docType.replace(/_/g, ' ')} expires in ${daysLeft} days. Please renew it.`,
          type: NotificationType.GENERAL,
          data: { url: '/driver/profile' },
        });
      }
    }
  }

  // --- Private helpers ---

  private async notifyDocumentStatusChange(
    doc: DocumentDocument,
    status: 'verified' | 'rejected',
  ) {
    if (doc.entityType !== DocEntityType.DRIVER) return;

    const driver = await this.driverModel
      .findById(doc.entityId)
      .select('userId')
      .lean();
    if (!driver?.userId) return;

    const docName = doc.docType.replace(/_/g, ' ');
    const title =
      status === 'verified' ? 'Document Verified' : 'Document Rejected';
    const body =
      status === 'verified'
        ? `Your ${docName} has been verified`
        : `Your ${docName} was rejected: ${doc.rejectionReason}`;

    this.notificationsService.notify({
      userId: driver.userId.toString(),
      title,
      body,
      type: NotificationType.GENERAL,
      data: { url: '/driver/profile' },
    });
  }
}
