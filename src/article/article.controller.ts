import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseInterceptors,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { RequestUser } from 'src/common/decorator/request-user';
import { ReqUser } from 'src/common/interface/user';
import { PublicRoute } from 'src/common/decorator/public';
import { FilesInterceptor } from '@nestjs/platform-express';
import { FindArticlesQueryDto } from 'src/article/dto/find-articles.dto';
import { SearchArticlesQueryDto } from 'src/article/dto/search-articles.dto';
import { CreateCommentDto } from 'src/comment/dto/create-comment';
import { CommentService } from 'src/comment/comment.service';

@Controller('articles')
export class ArticleController {
  constructor(
    private readonly articleService: ArticleService,
    private readonly commentService: CommentService,
  ) {}

  @UseInterceptors(FilesInterceptor('images', 5))
  @Post('')
  async create(
    @RequestUser() user: ReqUser,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() createArticleDto: CreateArticleDto,
  ) {
    return this.articleService.create(user, createArticleDto, files);
  }

  @PublicRoute()
  @Get('search')
  async search(@Query() query: SearchArticlesQueryDto) {
    return this.articleService.search(query);
  }

  @PublicRoute()
  @Get('')
  async findMany(@Query() query: FindArticlesQueryDto) {
    return this.articleService.findMany(query);
  }

  @Post(':id/comments')
  async createComment(
    @RequestUser() user: ReqUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: CreateCommentDto,
  ) {
    return this.commentService.create(user, id, payload);
  }

  @PublicRoute()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.articleService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @RequestUser() user: ReqUser,
    @Body() updateArticleDto: UpdateArticleDto,
  ) {
    return this.articleService.update(user, id, updateArticleDto);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number, @RequestUser() user: ReqUser) {
    return this.articleService.remove(user, id);
  }
}
