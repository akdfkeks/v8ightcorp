import { IsNotEmpty, IsString } from 'class-validator';
import { CreateCommentDto } from './create-comment';

export class CreateReplyDto extends CreateCommentDto {}
