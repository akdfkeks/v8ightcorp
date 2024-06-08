import { ArticleCategory } from 'src/database/model/article.entity';

export const isNotice = ({ category }: { category: string }) => category === ArticleCategory.NOTICE;
