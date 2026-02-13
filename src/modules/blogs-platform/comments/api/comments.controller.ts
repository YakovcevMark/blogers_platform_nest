import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastracture/query-repo';
import { CommentsService } from '../application/comments.service';
import { UpdateCommentDto } from './input-dto/update-comment.input-dto';
import { JwtOptionalAuthGuard } from '../../../users/guards/jwt-optional-auth.guard';
import {
  ExtractNotNecessaryUserFromRequest,
  ExtractUserFromRequest,
} from '../../../users/guards/decorators/param/extract-user-from-request.decorator';
import {
  NotNecessaryUserContextDto,
  UserContextDto,
} from '../../../users/guards/dto/user-context.dto';
import { JwtAuthGuard } from '../../../users/guards/jwt-auth.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ChangeCommentLikeStatusInputDto } from '../../blogs/api/input-dto/change-comment-like-status.input-dto';
import { ChangeCommentLikeStatusCommand } from '../application/usecases/change-comment-like-status.usecase';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentQueryRepository: CommentsQueryRepository,
    private commentsService: CommentsService,
    private readonly commandBus: CommandBus,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changeCommentLikeStatus(
    @ExtractUserFromRequest() user: UserContextDto,
    @Body() body: ChangeCommentLikeStatusInputDto,
    @Param('commentId') commentId: string,
  ) {
    return this.commandBus.execute<ChangeCommentLikeStatusCommand>(
      new ChangeCommentLikeStatusCommand({
        commentId,
        userId: user.id,
        newLikeStatus: body.likeStatus,
      }),
    );
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':commentId')
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() body: UpdateCommentDto,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.commentsService.update(commentId, body, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':commentId')
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserContextDto,
  ) {
    await this.commentsService.remove(commentId, user.id);
  }

  @UseGuards(JwtOptionalAuthGuard)
  @Get(':id')
  async getComment(
    @Param('id') id: string,
    @ExtractNotNecessaryUserFromRequest() user: NotNecessaryUserContextDto,
  ) {
    return this.commentQueryRepository.getById(id, user?.id);
  }
}
