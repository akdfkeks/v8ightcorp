import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomUUID } from 'crypto';

type UploadResult = {
  uploaded: Array<{ index: number; location: string }>;
  failed: Array<{ index: number }>;
};

@Injectable()
export class S3Service extends S3Client {
  constructor(private readonly configService: ConfigService) {
    super({
      region: configService.get('AWS_S3_REGION')!,
      credentials: {
        accessKeyId: configService.get('AWS_S3_ACCESS_KEY_ID')!,
        secretAccessKey: configService.get('AWS_S3_SECRET_ACCESS_KEY')!,
      },
    });
  }

  public async upload(files: Array<Express.Multer.File>): Promise<UploadResult> {
    const objectKeys = files.map(() => randomUUID());
    const works = files.map((file, idx) =>
      this.send(
        new PutObjectCommand({
          Bucket: this.configService.get('AWS_S3_BUCKET')!,
          Key: objectKeys[idx],
          Body: file.buffer,
          ContentType: file.mimetype,
        }),
      ),
    );

    const results = await Promise.allSettled(works);
    const uploaded = results
      .map((result, idx) => ({ result, idx }))
      .filter(({ result }) => result.status === 'fulfilled')
      .map(({ idx }) => ({
        index: idx,
        location: this.makeObjectLocation(objectKeys[idx]),
      }));

    const failed = results
      .map((result, idx) => ({ result, idx }))
      .filter(({ result }) => result.status === 'rejected')
      .map(({ idx }) => ({
        index: idx,
      }));

    return { uploaded, failed };
  }

  private makeObjectLocation(key: string) {
    return `https://${this.configService.get('AWS_S3_BUCKET')!}.s3.${this.configService.get('AWS_S3_REGION')!}.amazonaws.com/${key}`;
  }
}
