import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ArticleEntity } from './article.entity';

@Entity({ name: 'image' })
export class ImageEntity extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id', unsigned: true })
  id: number;

  @Column({ name: 'url' })
  url: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @ManyToOne(() => ArticleEntity, (article) => article.id)
  @JoinColumn({ name: 'article_id' })
  article: ArticleEntity;

  static from({ url, article }: { url: string; article: ArticleEntity }) {
    const image = new ImageEntity();
    image.url = url;
    image.article = article;
    return image;
  }
}
