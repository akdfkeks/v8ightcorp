import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from 'src/article/article.service';
import { S3Service } from 'src/aws/s3.service';
import { EntityManager, Repository } from 'typeorm';
import { ArticleCategory, ArticleEntity } from 'src/database/model/article.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException } from '@nestjs/common';
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

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: Repository<ArticleEntity>;
  let entityManager: EntityManager;

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

    service = module.get<ArticleService>(ArticleService);
    articleRepository = module.get<Repository<ArticleEntity>>(getRepositoryToken(ArticleEntity));
    entityManager = module.get<EntityManager>(getEntityManagerToken());
  });

  it('게시글 등록 결과를 반환합니다.', async () => {
    const result = await service.create(
      { id: 1, role: UserRole.ADMIN },
      {
        title: 'test',
        content: 'test',
        category: ArticleCategory.NOTICE,
      },
      [],
    );
    expect(result).toEqual({ message: '게시글을 등록했습니다.' });
  });

  it('일반 사용자는 공지사항을 등록할 수 없습니다.', async () => {
    const work = async () =>
      await service.create(
        { id: 1, role: UserRole.NORMAL },
        {
          title: 'test',
          content: 'test',
          category: ArticleCategory.NOTICE,
        },
        [],
      );
    expect(work).rejects.toThrow(ForbiddenException);
  });

  it('게시글 조회 결과를 반환합니다.', async () => {
    const article = await service.findOne(1);
    expect(article.id).toBe(1);
  });

  it('게시글 삭제 결과를 반환합니다.', async () => {
    const result = await service.remove({ id: 1, role: UserRole.ADMIN }, 1);
    expect(result).toEqual({ message: '게시글을 삭제했습니다.' });
  });

  it('일반 사용자는 자신의 글만 삭제할 수 있습니다.', async () => {
    const work = async () => await service.remove({ id: 2, role: UserRole.NORMAL }, 1);
    expect(work).rejects.toThrow(ForbiddenException);
  });

  it('일반 사용자는 공지사항을 삭제할 수 없습니다.', async () => {
    const work = async () => await service.remove({ id: 1, role: UserRole.NORMAL }, 1);
    expect(work).rejects.toThrow(ForbiddenException);
  });
});
