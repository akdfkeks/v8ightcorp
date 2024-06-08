import { CreateArticleDto } from 'src/article/dto/create-article.dto';
import { UserEntity } from './user.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ImageEntity } from './image.entity';
import { CommentEntity } from './comment.entity';

export enum ArticleCategory {
  NOTICE = 'notice',
  QNA = 'qna',
}

@Entity({ name: 'article' })
export class ArticleEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @Column({ name: 'category', type: 'enum', enum: ArticleCategory, default: ArticleCategory.QNA })
  category: ArticleCategory;

  @Column({ name: 'title' })
  title: string;

  @Column({ name: 'content' })
  content: string;

  @Column({ name: 'view', unsigned: true, default: 0 })
  view: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', default: null })
  deletedAt: Date | null;

  @ManyToOne(() => UserEntity, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @OneToMany(() => ImageEntity, (image) => image.article, { cascade: ['soft-remove'] })
  images: ImageEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.article, { cascade: ['soft-remove'] })
  comments: CommentEntity[];

  static from(payload: CreateArticleDto & { authorId: number }): ArticleEntity {
    const entity = new ArticleEntity();
    entity.title = payload.title;
    entity.category = payload.category;
    entity.author = { id: payload.authorId } as UserEntity;
    entity.content = payload.content;

    return entity;
  }
}
