import { Body, Controller, Delete, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { CommentService } from 'src/comment/comment.service';
import { CreateReplyDto } from 'src/comment/dto/create-reply';
import { UpdateCommentDto } from 'src/comment/dto/update-comment';
import { UpdateReplyDto } from 'src/comment/dto/update-reply';
import { RequestUser } from 'src/common/decorator/request-user';
import { ReqUser } from 'src/common/interface/user';

@Controller('')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Post('/comments/:id/replies')
  public async createReply(
    @RequestUser() user: ReqUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: CreateReplyDto,
  ) {
    return this.commentService.createReply(user, id, payload);
  }

  @Patch('/comments/:id')
  public async updateComment(
    @RequestUser() user: ReqUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateCommentDto,
  ) {
    return this.commentService.update(user, id, payload);
  }

  @Delete('/comments/:id')
  public async deleteComment(@RequestUser() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.delete(user, id);
  }

  @Patch('/replies/:id')
  public async updateReply(
    @RequestUser() user: ReqUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() payload: UpdateReplyDto,
  ) {
    return this.commentService.updateReply(user, id, payload);
  }

  @Delete('/replies/:id')
  public async deleteReply(@RequestUser() user: ReqUser, @Param('id', ParseIntPipe) id: number) {
    return this.commentService.deleteReply(user, id);
  }
}
