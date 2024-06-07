import { IsString, IsEnum } from 'class-validator';
import { ArticleCategory } from 'src/database/model/article.entity';

export class CreateArticleDto {
  @IsString()
  title: string;

  @IsEnum(ArticleCategory)
  category: ArticleCategory;

  @IsString()
  content: string;
}
