import { PostsRepository } from '../../infrastracture/repo';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DomainNotFoundException } from '../../../../../core/exceptions/domain-exceptions';
import { UpdatePostDto } from '../../api/input-dto/update-post.input-dto';

export class UpdatePostCommand {
  constructor(
    public postId: string,
    public dto: UpdatePostDto,
  ) {}
}

@CommandHandler(UpdatePostCommand)
export class UpdatePostUseCase implements ICommandHandler<UpdatePostCommand> {
  constructor(private postsRepo: PostsRepository) {}

  async execute({ postId, dto }: UpdatePostCommand) {
    const post = await this.postsRepo.getById(postId);
    if (!post) {
      throw new DomainNotFoundException('Post not found');
    }
    post.update(dto);
    await this.postsRepo.savePost(post);
  }
}
