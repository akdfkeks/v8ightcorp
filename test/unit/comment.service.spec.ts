import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from 'src/article/article.service';
import { S3Service } from 'src/aws/s3.service';
import { EntityManager, Repository } from 'typeorm';
import { ArticleEntity } from 'src/database/model/article.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { UserEntity, UserRole } from 'src/database/model/user.entity';
import { CommentEntity, ReplyEntity } from 'src/database/model/comment.entity';
import { CommentService } from 'src/comment/comment.service';
import {
  UserRepoMock,
  ArticleRepoMock,
  CommentRepoMock,
  ReplyRepoMock,
  S3ServiceMock,
  EntityManagerMock,
} from 'test/unit/mock';
import { ForbiddenException } from '@nestjs/common';

describe('CommentService', () => {
  let entityManager: EntityManager;
  let articleService: ArticleService;
  let commentService: CommentService;
  let articleRepository: Repository<ArticleEntity>;
  let commentRepository: Repository<CommentEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        ArticleService,
        CommentService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: UserRepoMock,
        },
        {
          provide: getRepositoryToken(ArticleEntity),
          useValue: ArticleRepoMock,
        },
        {
          provide: getRepositoryToken(CommentEntity),
          useValue: CommentRepoMock,
        },
        {
          provide: getRepositoryToken(ReplyEntity),
          useValue: ReplyRepoMock,
        },
        {
          provide: S3Service,
          useValue: S3ServiceMock,
        },
        {
          provide: getEntityManagerToken(),
          useValue: EntityManagerMock,
        },
      ],
    }).compile();

    commentService = module.get<CommentService>(CommentService);
    articleService = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<Repository<ArticleEntity>>(getRepositoryToken(ArticleEntity));
    entityManager = module.get<EntityManager>(getEntityManagerToken());
  });

  it('댓글 등록 결과를 반환합니다.', async () => {
    const result = await commentService.create({ id: 1, role: UserRole.ADMIN }, 1, {
      content: '테스트 댓글',
    });
    expect(result).toEqual({ message: '댓글을 등록했습니다.' });
  });

  it('답글 등록 결과를 반환합니다.', async () => {
    const result = await commentService.createReply({ id: 1, role: UserRole.ADMIN }, 1, {
      content: '테스트 답글',
    });
    expect(result).toEqual({ message: '답글을 등록했습니다.' });
  });

  it('댓글 삭제 결과를 반환합니다.', async () => {
    const result = await commentService.delete({ id: 1, role: UserRole.ADMIN }, 1);
    expect(result).toEqual({ message: '댓글을 삭제했습니다.' });
  });

  it('답글 삭제 결과를 반환합니다.', async () => {
    const result = await commentService.deleteReply({ id: 1, role: UserRole.ADMIN }, 1);
    expect(result).toEqual({ message: '답글을 삭제했습니다.' });
  });

  it('관리자는 사용자의 댓글을 삭제할 수 있습니다.', async () => {
    const result = await commentService.delete({ id: 2, role: UserRole.ADMIN }, 1);
    expect(result).toEqual({ message: '댓글을 삭제했습니다.' });
  });

  it('관리자는 사용자의 답글을 삭제할 수 있습니다.', async () => {
    const result = await commentService.deleteReply({ id: 2, role: UserRole.ADMIN }, 1);
    expect(result).toEqual({ message: '답글을 삭제했습니다.' });
  });

  it('사용자는 자신의 댓글만 삭제할 수 있습니다.', async () => {
    const work = async () => await commentService.delete({ id: 2, role: UserRole.NORMAL }, 1);
    expect(work).rejects.toThrow(ForbiddenException);
  });

  it('사용자는 자신의 답글만 삭제할 수 있습니다.', async () => {
    const work = async () => await commentService.deleteReply({ id: 2, role: UserRole.NORMAL }, 1);
    expect(work).rejects.toThrow(ForbiddenException);
  });
});
