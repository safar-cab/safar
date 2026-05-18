import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService implements OnModuleInit {
  private readonly logger = new Logger(PushService.name);
  private initialized = false;

  constructor(private configService: ConfigService) {}

  onModuleInit() {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService.get<string>('FIREBASE_PRIVATE_KEY');

    if (!projectId || !clientEmail || !privateKey) {
      this.logger.warn('Firebase not configured — push notifications disabled');
      return;
    }

    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, '\n'),
        }),
      });
      this.initialized = true;
      this.logger.log('Firebase Admin initialized');
    } catch (error) {
      this.logger.error('Firebase init failed', error);
    }
  }

  async sendToUser(
    tokens: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ): Promise<string[]> {
    if (!this.initialized || tokens.length === 0) return [];

    const invalidTokens: string[] = [];

    try {
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: data || {},
        webpush: {
          fcmOptions: { link: data?.url || '/' },
          notification: {
            icon: '/icons/icon-192x192.png',
            badge: '/icons/icon-72x72.png',
          },
        },
      });

      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const code = resp.error?.code;
          if (
            code === 'messaging/invalid-registration-token' ||
            code === 'messaging/registration-token-not-registered'
          ) {
            invalidTokens.push(tokens[idx]);
          }
          this.logger.warn(`Push failed for token ${idx}: ${resp.error?.message}`);
        }
      });

      this.logger.log(`Push sent: ${response.successCount}/${tokens.length} succeeded`);
    } catch (error) {
      this.logger.error('Push send failed', error);
    }

    return invalidTokens;
  }
}
