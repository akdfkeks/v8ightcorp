import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { S3Service } from 'src/aws/s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/database/model/article.entity';
import { ImageEntity } from 'src/database/model/image.entity';
import { UserEntity } from 'src/database/model/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, ImageEntity, UserEntity])],
  controllers: [ArticleController],
  providers: [ArticleService, S3Service],
})
export class ArticleModule {}
