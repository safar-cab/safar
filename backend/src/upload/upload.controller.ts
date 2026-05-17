import { Controller, Post, Delete, Body, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';

@ApiTags('Upload')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post('presigned-url')
  @ApiOperation({ summary: 'Get presigned S3 upload URL' })
  getPresignedUrl(
    @Body()
    body: {
      folder: string;
      fileName: string;
      contentType: string;
    },
  ) {
    return this.uploadService.getPresignedUploadUrl(
      body.folder,
      body.fileName,
      body.contentType,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Delete file from S3' })
  deleteFile(@Query('key') key: string) {
    return this.uploadService.deleteFile(key);
  }
}
