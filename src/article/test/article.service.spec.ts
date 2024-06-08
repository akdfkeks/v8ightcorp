import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from '../article.service';
import { S3Service } from 'src/aws/s3.service';
import { EntityManager, ObjectLiteral, Repository, createQueryBuilder } from 'typeorm';
import { ArticleCategory, ArticleEntity } from 'src/database/model/article.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserEntity, UserRole } from 'src/database/model/user.entity';
import { CommentEntity, ReplyEntity } from 'src/database/model/comment.entity';
import { CommentService } from 'src/comment/comment.service';
import * as Dummy from 'src/article/test/dummy';

const UserRepoMock = {
  find: jest.fn().mockReturnValue([Dummy.ALICE]),
};

const ArticleRepoMock = {
  save: async (e: any) => e,
  find: jest.fn().mockReturnValue([Dummy.ARTICLE]),
  findOne: jest.fn().mockReturnValue(Dummy.ARTICLE),
  findOneBy: jest.fn().mockReturnValue(Dummy.ARTICLE),
};

const CommentRepoMock = {
  findOne: jest.fn().mockReturnValue(Dummy.COMMENT),
  findOneBy: jest.fn().mockReturnValue(Dummy.COMMENT),
  update: jest.fn().mockReturnValue({ affected: 1 }),
  softRemove: jest.fn().mockReturnValue(new Promise((res) => res(true))),
  createQueryBuilder: jest.fn().mockReturnValue({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockReturnValue([Dummy.ARTICLE_WITH_RELATED]),
  }),
};

const ReplyRepoMock = {
  findOneBy: jest.fn().mockReturnValue(Dummy.REPLY),
  update: jest.fn().mockReturnValue({ affected: 1 }),
};

const EntityManagerMock = {
  transaction: jest.fn().mockReturnValue(new Promise((res) => res(true))),
};

const S3ServiceMock = {
  upload: jest.fn().mockReturnValue({ uploaded: [], failed: [] }),
};

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

    await articleRepository.save({
      id: 1,
      title: 'test',
      content: 'test',
      category: ArticleCategory.NOTICE,
    });
  });

  it('should return message.', async () => {
    const r = await service.create(
      { id: 1, role: UserRole.ADMIN },
      {
        title: 'test',
        content: 'test',
        category: ArticleCategory.NOTICE,
      },
      [],
    );
    expect(r).toEqual({ message: '게시글을 등록했습니다.' });
  });

  it('should throw forbidden exception.', async () => {
    const fn = async () =>
      await service.create(
        { id: 1, role: UserRole.NORMAL },
        {
          title: 'test',
          content: 'test',
          category: ArticleCategory.NOTICE,
        },
        [],
      );
    expect(fn).rejects.toThrow(ForbiddenException);
  });

  it('should return article.', async () => {
    expect((await service.findOne(1)).id).toBe(1);
  });
});
