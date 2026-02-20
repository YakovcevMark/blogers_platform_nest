import { CommentsRepository } from '../../infrastracture/repo';

import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';
import { InjectModel } from '@nestjs/mongoose';
import { CreateCommentInputDto } from '../../api/input-dto/comment.input-dto';
import { CommentModel, CommentModelName } from '../../domain/comment.entity';
import { PostsRepository } from '../../../posts/infrastracture/repo';
import { UsersRepository } from '../../../../users/infrastructure/users.repo';

export class CreateCommentCommand {
  constructor(
    public postId: string,
    public dto: CreateCommentInputDto,
    public userId: string,
  ) {}
}

@CommandHandler(CreateCommentCommand)
export class CreateCommentUseCase implements ICommandHandler<
  CreateCommentCommand,
  string
> {
  constructor(
    @InjectModel(CommentModelName) private readonly CommentModel: CommentModel,
    private usersRepo: UsersRepository,
    private postsRepo: PostsRepository,
    private commentsRepository: CommentsRepository,
  ) {}

  async execute({ userId, postId, dto }: CreateCommentCommand) {
    const post = await this.postsRepo.getById(postId);
    if (!post) throw new DomainNotFoundException('Post not found');

    const user = await this.usersRepo.getById(userId);
    if (!user) throw new DomainNotFoundException('User not found');

    const comment = this.CommentModel.createComment({
      postId,
      content: dto.content,
      commentatorInfo: {
        userId: user._id.toString(),
        userLogin: user.login,
      },
    });

    await this.commentsRepository.saveComment(comment);

    return comment._id.toString();
  }
}
