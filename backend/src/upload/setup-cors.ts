/**
 * One-time script to set CORS on S3 bucket.
 * Run: npx ts-node -r tsconfig-paths/register src/upload/setup-cors.ts
 */
import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
dotenv.config();

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

async function setupCors() {
  const bucket = process.env.AWS_S3_BUCKET || '';
  console.log(`Setting CORS on bucket: ${bucket}`);

  await s3.send(
    new PutBucketCorsCommand({
      Bucket: bucket,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'HEAD'],
            AllowedOrigins: [
              'http://localhost:5173',
              'http://localhost:3000',
              process.env.FRONTEND_URL || 'http://localhost:5173',
            ],
            ExposeHeaders: ['ETag'],
            MaxAgeSeconds: 3600,
          },
        ],
      },
    }),
  );

  console.log('CORS configured successfully!');
}

setupCors().catch(console.error);
