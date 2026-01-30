import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastracture/query-repo';
import { CommentsService } from '../application/comments.service';
import { UpdateCommentDto } from './input-dto/update-comment.input-dto';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
  ) {}

  @Get(':id')
  async getComment(@Param('id') id: string) {
    return this.commentQueryRepository.getById(id);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentDto,
  ) {
    await this.commentsService.update(commentId, body);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(@Param('commentId') commentId: string) {
    await this.commentsService.remove(commentId);
  }
}
