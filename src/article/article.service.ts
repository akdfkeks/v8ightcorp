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
import { SearchArticlesQueryDto, SearchType } from 'src/article/dto/search-articles.dto';
import { CommentService } from 'src/comment/comment.service';
import { isAdmin } from 'src/common/util/user';
import { isNotice } from 'src/common/util/article';

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
    if (isNotice(payload) && !isAdmin(user)) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    const uploadResult = await this.s3service.upload(files);
    const failedCount = uploadResult.failed.length;

    // 파일이 첨부되지 않은 경우엔 0일것
    if (failedCount > 0) {
      // TODO: delete uploaded object
      throw new InternalServerErrorException('게시글 등록에 실패했습니다.');
    }

    await this.entityManager
      .transaction('REPEATABLE READ', async (manager) => {
        const article = await manager.save(ArticleEntity.from({ ...payload, authorId: user.id }));
        const imageEntities = uploadResult.uploaded.map((upload) =>
          // article id가 필요해서 Promise.all로 묶을 수가 없음
          ImageEntity.from({ url: upload.location, articleId: article.id }),
        );

        await manager.save(imageEntities);
      })
      .catch((e) => {
        console.log(e); // TODO: logging
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
      case SearchType.TITLE:
        whereCondition.where = { title: Like(`%${query.keyword}%`) };
        break;

      case SearchType.AUTHOR:
        const users = await this.userRepository.find({
          where: { name: Like(`%${query.keyword}%`) },
        });
        const userIds = users.map((user) => user.id);
        whereCondition.where = [{ author: { id: In(userIds) } }];
        break;

      case SearchType.ALL:
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

    const articles = await this.articleRepository.find(whereCondition).catch((e) => {
      console.log(e); // TODO: logging
      throw new InternalServerErrorException('게시글 검색에 실패했습니다.');
    });

    return { articles };
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

    const articles = await this.articleRepository.find(options).catch((e) => {
      console.log(e); // TODO: logging
      throw new InternalServerErrorException('게시글 목록 조회에 실패했습니다.');
    });

    return { articles };
  }

  public async findOne(id: number) {
    const article =
      (await this.articleStore.get<ArticleEntity>(id.toString())) ??
      (await this.articleRepository.findOne({
        where: { id },
        relations: ['images'],
      }));

    if (article == null) {
      throw new NotFoundException('게시글이 존재하지 않습니다.');
    }

    // 사용자는 캐싱을 굳이 기다리지 않아도 됨
    this.articleStore.set(id.toString(), { ...article, view: ++article.view }, 11000).catch((e) => {
      console.log(e); // TODO: logging
    });

    const comments = await this.commentService.getCommentsAndReplies(id).catch((e) => {
      console.log(e); // TODO: logging
      throw new InternalServerErrorException('게시글 조회에 실패했습니다.');
    });

    const { deletedAt, updatedAt, images: imgs, ...rest } = article;
    const images = imgs ? imgs.map((v) => v.url) : [];

    return { ...rest, images, comments };
  }

  public async update(user: ReqUser, id: number, updateArticleDto: UpdateArticleDto) {
    await this.entityManager.transaction(async (manager) => {
      const article = await manager.findOneBy(ArticleEntity, { id });
      if (!article) {
        throw new NotFoundException('게시글이 존재하지 않습니다.');
      }

      if (isNotice(article) && !isAdmin(user)) {
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

    if (!isAdmin(user) && user.id !== entity.authorId) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    await this.entityManager
      .transaction(async (tx) => {
        await Promise.all([tx.softRemove(entity.comments), tx.softRemove(entity)]);
      })
      .catch((e) => {
        console.log(e); // TODO: logging
        throw new InternalServerErrorException('게시글 삭제 중 오류가 발생했습니다.');
      });

    return { message: '게시글을 삭제했습니다.' };
  }

  @Cron('*/10 * * * * *')
  public async updateViewCount() {
    const keys = await this.articleStore.store.keys();
    for (const key of keys) {
      const article = await this.articleStore.get<ArticleEntity>(key);
      if (article)
        this.articleRepository.update({ id: article.id }, { view: article.view }).catch((e) => {
          console.log(e); // TODO: logging
        });
    }
  }
}
