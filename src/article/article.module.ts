import { Module } from '@nestjs/common';
import { ArticleService } from './article.service';
import { ArticleController } from './article.controller';
import { S3Service } from 'src/aws/s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from 'src/database/model/article.entity';
import { UserEntity } from 'src/database/model/user.entity';
import { CommentService } from 'src/comment/comment.service';
import { CommentEntity, ReplyEntity } from 'src/database/model/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, UserEntity, CommentEntity, ReplyEntity])],
  controllers: [ArticleController],
  providers: [ArticleService, S3Service, CommentService],
})
export class ArticleModule {}
