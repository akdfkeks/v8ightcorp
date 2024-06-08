import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCommentDto } from 'src/comment/dto/create-comment';
import { CreateReplyDto } from 'src/comment/dto/create-reply';
import { UpdateCommentDto } from 'src/comment/dto/update-comment';
import { UpdateReplyDto } from 'src/comment/dto/update-reply';
import { ReqUser } from 'src/common/interface/user';
import { isAdmin } from 'src/common/util/user';
import { ArticleEntity } from 'src/database/model/article.entity';
import { CommentEntity, ReplyEntity } from 'src/database/model/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: Repository<CommentEntity>,
    @InjectRepository(ReplyEntity)
    private readonly replyRepository: Repository<ReplyEntity>,
  ) {}

  public async getCommentsAndReplies(articleId: number) {
    const commentsWithReplies = await this.commentRepository
      .createQueryBuilder('comment')
      .leftJoinAndSelect('comment.replies', 'reply')
      .leftJoinAndSelect('comment.author', 'commentAuthor')
      .leftJoinAndSelect('reply.author', 'replyAuthor')
      .where('comment.article_id = :articleId', { articleId })
      .getMany();

    // 댓글/답글이 상당히 많으면 성능 저하
    // setImmediate로 끊어서 처리할 수 있을듯
    return commentsWithReplies.map(({ id, author, content, createdAt, replies }) => {
      return {
        id,
        authorId: author.id,
        authorName: author.name,
        content,
        createdAt,
        replies: replies.map(({ id, author, content, createdAt }) => {
          return {
            id,
            authorId: author.id,
            authorName: author.name,
            content,
            createdAt,
          };
        }),
      };
    });
  }

  public async create(user: ReqUser, articleId: number, payload: CreateCommentDto) {
    const article = await this.articleRepository.findOneBy({ id: articleId });
    if (!article) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    await this.commentRepository
      .save(CommentEntity.from({ ...payload, articleId, authorId: user.id }))
      .catch((e) => {
        console.log(e);
        throw new InternalServerErrorException('댓글 등록에 실패했습니다.');
      });

    return { message: '댓글을 등록했습니다.' };
  }

  public async createReply(user: ReqUser, commentId: number, payload: CreateReplyDto) {
    const comment = await this.commentRepository.findOneBy({ id: commentId });
    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }

    await this.replyRepository
      .save(ReplyEntity.from({ ...payload, commentId, authorId: user.id }))
      .catch((e) => {
        console.log(e);
        throw new InternalServerErrorException('답글 등록에 실패했습니다.');
      });

    return { message: '답글을 등록했습니다.' };
  }

  public async update(user: ReqUser, id: number, payload: UpdateCommentDto) {
    const comment = await this.commentRepository.findOneBy({ id });
    if (!comment) {
      throw new NotFoundException('댓글이 존재하지 않습니다.');
    }
    if (comment.authorId !== user.id) {
      throw new ForbiddenException('댓글을 수정할 권한이 없습니다.');
    }

    const updateResult = await this.commentRepository.update({ id }, { ...payload });
    if (!updateResult.affected || updateResult.affected == 0) {
      throw new InternalServerErrorException('댓글을 수정할 수 없습니다.');
    }

    return { message: '댓글을 수정했습니다.' };
  }

  public async updateReply(user: ReqUser, id: number, payload: UpdateReplyDto) {
    const entity = await this.replyRepository.findOneBy({ id });

    if (!entity) throw new NotFoundException('답글이 존재하지 않습니다.');

    if (entity.authorId !== user.id) throw new ForbiddenException('답글을 수정할 권한이 없습니다.');

    const updateResult = await this.replyRepository.update({ id }, { ...payload });

    if (!updateResult.affected || updateResult.affected == 0)
      throw new InternalServerErrorException('답글을 수정할 수 없습니다.');

    return { message: '답글을 수정했습니다.' };
  }

  public async delete(user: ReqUser, id: number) {
    const entity = await this.commentRepository.findOne({
      where: { id },
      relations: ['replies'],
    });

    if (!entity) throw new NotFoundException('댓글이 존재하지 않습니다.');
    if (entity.authorId !== user.id && !isAdmin(user))
      throw new ForbiddenException('댓글을 삭제할 권한이 없습니다.');

    await this.commentRepository.softRemove(entity).catch((e) => {
      throw new InternalServerErrorException('댓글을 삭제하지 못했습니다.');
    });

    return { message: '댓글을 삭제했습니다.' };
  }

  public async deleteReply(user: ReqUser, id: number) {
    const entity = await this.replyRepository.findOneBy({ id });

    if (!entity) throw new NotFoundException('답글이 존재하지 않습니다.');
    if (entity.authorId !== user.id && !isAdmin(user))
      throw new ForbiddenException('답글을 삭제할 권한이 없습니다.');

    await this.replyRepository.softRemove(entity).catch((e) => {
      throw new InternalServerErrorException('답글을 삭제하지 못했습니다.');
    });

    return { message: '답글을 삭제했습니다.' };
  }
}
