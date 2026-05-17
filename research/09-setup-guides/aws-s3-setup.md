# AWS S3 Setup Guide

## 1. AWS Account

1. Go to https://aws.amazon.com
2. Create account (credit card required)
3. Free tier: 5GB S3 storage for 12 months

## 2. Create S3 Bucket

1. S3 Console → Create Bucket
2. Bucket name: `cab-booking-uploads` (globally unique)
3. Region: `ap-south-1` (Mumbai)
4. Uncheck "Block all public access" (we'll use presigned URLs)
5. Enable versioning: Optional
6. Encryption: SSE-S3 (default)

## 3. CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.in"],
    "ExposeHeaders": ["ETag"],
    "MaxAgeSeconds": 3600
  }
]
```

## 4. Create IAM User

1. IAM Console → Users → Create User
2. Name: `cab-booking-s3`
3. Attach policy: Create custom policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::cab-booking-uploads",
        "arn:aws:s3:::cab-booking-uploads/*"
      ]
    }
  ]
}
```

4. Create Access Key → Save credentials

## 5. Environment Variables

```env
AWS_ACCESS_KEY_ID=AKIAxxxxxxxxxxxxxxxxxx
AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
AWS_S3_BUCKET=cab-booking-uploads
AWS_S3_REGION=ap-south-1
```

## 6. Install SDK

```bash
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

## 7. Server-Side Code

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuid } from 'uuid';

const s3 = new S3Client({
  region: process.env.AWS_S3_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Generate presigned URL for upload (client uploads directly to S3)
export async function getUploadUrl(folder: string, fileType: string) {
  const ext = fileType.split('/')[1]; // image/jpeg → jpeg
  const key = `${folder}/${uuid()}.${ext}`;

  const command = new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
    ContentType: fileType,
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 }); // 5 min
  const fileUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_S3_REGION}.amazonaws.com/${key}`;

  return { uploadUrl, fileUrl, key };
}

// Delete file
export async function deleteFile(key: string) {
  await s3.send(new DeleteObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: key,
  }));
}
```

## 8. API Route

```typescript
// app/api/upload/presigned-url/route.ts
import { getUploadUrl } from '@/lib/s3';
import { getServerSession } from 'next-auth';

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { folder, fileType } = await req.json();

  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(fileType)) {
    return Response.json({ error: 'Invalid file type' }, { status: 400 });
  }

  const { uploadUrl, fileUrl } = await getUploadUrl(folder, fileType);
  return Response.json({ uploadUrl, fileUrl });
}
```

## 9. Client-Side Upload

```typescript
async function uploadFile(file: File, folder: string) {
  // Get presigned URL
  const res = await fetch('/api/upload/presigned-url', {
    method: 'POST',
    body: JSON.stringify({ folder, fileType: file.type }),
  });
  const { uploadUrl, fileUrl } = await res.json();

  // Upload directly to S3
  await fetch(uploadUrl, {
    method: 'PUT',
    body: file,
    headers: { 'Content-Type': file.type },
  });

  return fileUrl; // Save this URL in your database
}
```

## 10. Folder Structure in S3

```
cab-booking-uploads/
├── cars/
│   ├── photos/          # Car photos
│   └── documents/       # RC, insurance, PUC, fitness
├── drivers/
│   ├── photos/          # Driver photos
│   └── documents/       # License, Aadhaar
└── users/
    └── photos/          # Profile photos
```

## 11. Image Optimization
- Compress before upload using `sharp` on server or browser-side compression
- Max dimensions: 1920x1080 for photos, keep original for documents
- Use WebP format where possible
