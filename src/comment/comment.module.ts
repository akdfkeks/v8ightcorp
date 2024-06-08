import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentController } from 'src/comment/comment.controller';
import { CommentService } from 'src/comment/comment.service';
import { ArticleEntity } from 'src/database/model/article.entity';
import { CommentEntity, ReplyEntity } from 'src/database/model/comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ArticleEntity, CommentEntity, ReplyEntity])],
  controllers: [CommentController],
  providers: [CommentService],
})
export class CommentModule {}
