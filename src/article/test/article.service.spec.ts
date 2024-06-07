import { Test, TestingModule } from '@nestjs/testing';
import { ArticleService } from '../article.service';
import { S3Service } from 'src/aws/s3.service';
import { EntityManager, Repository } from 'typeorm';
import { ArticleCategory, ArticleEntity } from 'src/database/model/article.entity';
import { getEntityManagerToken, getRepositoryToken } from '@nestjs/typeorm';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { UserRole } from 'src/database/model/user.entity';

class MockS3Service {
  async upload(files: any[]) {
    return { uploaded: [], failed: [] };
  }
}

class MockRepository {
  private data = new Map<number, any>();

  async find(options?: any) {
    return Array.from(this.data.values());
  }

  async findOne(options?: any) {
    return this.data.get(options.where.id);
  }

  async findOneBy(criteria: any) {
    return this.data.get(criteria.id);
  }

  async save(entity: any) {
    this.data.set(entity.id, entity);
    return entity;
  }

  async update(id: number, entity: any) {
    if (this.data.has(id)) {
      const existing = this.data.get(id);
      const updated = { ...existing, ...entity };
      this.data.set(id, updated);
      return { affected: 1 };
    }
    return { affected: 0 };
  }

  async softRemove(entity: any) {
    if (this.data.has(entity.id)) {
      this.data.delete(entity.id);
      return entity;
    }
    return null;
  }
}

class MockEntityManager {
  private data = new Map<number, any>();

  async transaction(isolationLevel: string, runInTransaction: (manager: any) => Promise<void>) {
    await runInTransaction(this);
  }

  async save(entity: any) {
    this.data.set(entity.id, entity);
    return entity;
  }

  async findOneBy(entityClass: any, criteria: any) {
    return this.data.get(criteria.id);
  }

  async update(entityClass: any, id: number, entity: any) {
    if (this.data.has(id)) {
      const existing = this.data.get(id);
      const updated = { ...existing, ...entity };
      this.data.set(id, updated);
      return { affected: 1 };
    }
    return { affected: 0 };
  }
}

describe('ArticleService', () => {
  let service: ArticleService;
  let articleRepository: Repository<ArticleEntity>;
  let entityManager: EntityManager;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [CacheModule.register({ isGlobal: true })],
      providers: [
        ArticleService,
        {
          provide: getRepositoryToken(ArticleEntity),
          useClass: MockRepository,
        },
        {
          provide: S3Service,
          useClass: MockS3Service,
        },
        {
          provide: getEntityManagerToken(),
          useClass: MockEntityManager,
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

  it('should throw notfound exception.', async () => {
    const fn = async () => await service.findOne(2);
    expect(fn).rejects.toThrow(NotFoundException);
  });
});
