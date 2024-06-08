import { CreateCommentDto } from 'src/comment/dto/create-comment';
import { ArticleEntity } from './article.entity';
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
import { CreateReplyDto } from 'src/comment/dto/create-reply';

@Entity({ name: 'comment' })
export class CommentEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @ManyToOne(() => ArticleEntity, (article) => article.id, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'content' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', default: null })
  deletedAt: Date | null;

  @OneToMany(() => ReplyEntity, (reply) => reply.comment, { cascade: ['soft-remove'] })
  replies: ReplyEntity[];

  static from(payload: CreateCommentDto & { articleId: number; authorId: number }) {
    const entity = new CommentEntity();
    entity.article = { id: payload.articleId } as ArticleEntity;
    entity.author = { id: payload.authorId } as UserEntity;
    entity.content = payload.content;

    return entity;
  }
}

@Entity({ name: 'reply' })
export class ReplyEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @ManyToOne(() => CommentEntity, (comment) => comment.id, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'comment_id' })
  comment: CommentEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, { cascade: ['soft-remove'] })
  @JoinColumn({ name: 'author_id' })
  author: UserEntity;

  @Column({ name: 'author_id' })
  authorId: number;

  @Column({ name: 'content' })
  content: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', default: null })
  deletedAt: Date | null;

  static from(payload: CreateReplyDto & { commentId: number; authorId: number }) {
    const entity = new ReplyEntity();
    entity.comment = { id: payload.commentId } as CommentEntity;
    entity.author = { id: payload.authorId } as UserEntity;
    entity.content = payload.content;

    return entity;
  }
}
