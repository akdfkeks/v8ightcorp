import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';
import { ReqUser } from 'src/common/interface/user';
import { S3Service } from 'src/aws/s3.service';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { ArticleCategory, ArticleEntity } from 'src/database/model/article.entity';
import { EntityManager, FindManyOptions, In, Like, MoreThan, Repository } from 'typeorm';
import { UserEntity, UserRole } from 'src/database/model/user.entity';
import { FindArticlesQueryDto, Period, SortOrder } from 'src/article/dto/find-articles.dto';
import { ImageEntity } from 'src/database/model/image.entity';
import { Cron } from '@nestjs/schedule';
import { SearchArticlesQueryDto, SerachType } from 'src/article/dto/search-articles.dto';
import { CommentService } from 'src/comment/comment.service';

@Injectable()
export class ArticleService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly articleStore: Cache,
    private readonly s3service: S3Service,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(ArticleEntity)
    private readonly articleRepository: Repository<ArticleEntity>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    private readonly commentService: CommentService,
  ) {}

  public async create(
    user: ReqUser,
    payload: CreateArticleDto,
    files: Array<Express.Multer.File> = [],
  ) {
    if (user.role !== UserRole.ADMIN && payload.category == ArticleCategory.NOTICE) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const uploadResult = await this.s3service.upload(files);
    if (files.length !== 0 && uploadResult.failed.length !== 0) {
      // logics to delete uploaded objects
      throw new InternalServerErrorException('게시글 등록에 실패했습니다.');
    }

    await this.entityManager
      .transaction('REPEATABLE READ', async (manager) => {
        const article = await manager.save(ArticleEntity.from({ ...payload, authorId: user.id }));
        const imageEntities = uploadResult.uploaded.map((upload) =>
          ImageEntity.from({ url: upload.location, articleId: article.id }),
        );
        await manager.save(imageEntities);
      })
      .catch((e) => {
        throw new InternalServerErrorException('게시글 등록에 실패했습니다.');
      });

    return { message: '게시글을 등록했습니다.' };
  }

  public async search(query: SearchArticlesQueryDto) {
    const whereCondition: FindManyOptions<ArticleEntity> = {
      take: 20,
      skip: (query.page - 1) * 20,
      select: ['id', 'title', 'category', 'view', 'createdAt'],
    };

    switch (query.type) {
      case SerachType.TITLE:
        whereCondition.where = { title: Like(`%${query.keyword}%`) };
        break;
      case SerachType.AUTHOR:
        const users = await this.userRepository.find({
          where: { name: Like(`%${query.keyword}%`) },
        });
        const userIds = users.map((user) => user.id);
        whereCondition.where = [{ author: { id: In(userIds) } }];
        break;
      case SerachType.ALL:
        const matchedUsers = await this.userRepository.find({
          where: { name: Like(`%${query.keyword}%`) },
        });
        const matchedUserIds = matchedUsers.map((user) => user.id);
        whereCondition.where = [
          { title: Like(`%${query.keyword}%`) },
          { author: In(matchedUserIds) },
        ];
        break;
    }

    return { articles: await this.articleRepository.find(whereCondition) };
  }

  public async findMany(query: FindArticlesQueryDto) {
    const options: FindManyOptions<ArticleEntity> = {
      order: query.sort === SortOrder.Latest ? { createdAt: 'DESC' } : { view: 'DESC' },
      take: 20,
      skip: (query.page - 1) * 20,
      select: ['id', 'title', 'category', 'view', 'createdAt'],
    };

    if (query.sort === SortOrder.Best) {
      const dateLimit = new Date();
      switch (query.period) {
        case Period.Year:
          dateLimit.setFullYear(dateLimit.getFullYear() - 1);
          break;
        case Period.Month:
          dateLimit.setMonth(dateLimit.getMonth() - 1);
          break;
        case Period.Week:
          dateLimit.setDate(dateLimit.getDate() - 7);
          break;
        case Period.All:
          dateLimit.setFullYear(1970); // A long time ago
          break;
      }
      options.where = { createdAt: MoreThan(dateLimit) };
    }

    return { articles: await this.articleRepository.find(options) };
  }

  public async findOne(id: number) {
    let article =
      (await this.articleStore.get<ArticleEntity>(id.toString())) ??
      (await this.articleRepository.findOne({
        where: { id },
        relations: ['images'],
      }));

    if (article == null) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    this.articleStore.set(id.toString(), { ...article, view: ++article.view }, 11000);

    const commentsWithReplies = await this.commentService.getCommentsAndReplies(id);

    const { deletedAt, updatedAt, images: imgs, ...rest } = article;
    const images = imgs ? imgs.map((v) => v.url) : [];

    return { ...rest, images, view: rest.view, comments: commentsWithReplies };
  }

  public async update(
    user: ReqUser,
    id: number,
    updateArticleDto: UpdateArticleDto,
    files: Array<Express.Multer.File>,
  ) {
    await this.entityManager.transaction(async (manager) => {
      const article = await manager.findOneBy(ArticleEntity, { id });
      if (!article) {
        throw new NotFoundException('게시글이 존재하지 않습니다.');
      }

      if (article.category === ArticleCategory.NOTICE && user.role !== UserRole.ADMIN) {
        throw new ForbiddenException('권한이 없습니다.');
      }

      const updateResult = await manager.update(ArticleEntity, id, updateArticleDto);
      if (updateResult.affected === 0) {
        throw new NotFoundException('게시글 수정에 실패했습니다.');
      }
    });
    return { message: '게시글을 수정했습니다.' };
  }

  public async remove(user: ReqUser, id: number) {
    const entity = await this.articleRepository.findOne({
      where: { id },
      relations: ['images', 'comments', 'comments.replies'],
    });
    if (!entity) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    if (entity.category === ArticleCategory.NOTICE && user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    await this.entityManager
      .transaction(async (tx) => {
        await Promise.all([
          ...entity.comments.map((comment) => tx.softRemove(comment)),
          tx.softRemove(entity),
        ]);
      })
      .catch((e) => {
        console.log(e);
        throw new InternalServerErrorException('게시글 삭제 중 오류가 발생했습니다.');
      });

    return { message: '게시글을 삭제했습니다.' };
  }

  @Cron('*/10 * * * * *')
  public async updateViewCount() {
    const keys = await this.articleStore.store.keys();
    keys.forEach(async (v) => {
      const a = await this.articleStore.get<ArticleEntity>(v);
      if (a) this.articleRepository.update({ id: a.id }, { view: a.view });
    });
  }
}
