import { PostsRepository } from '../../infrastracture/repo';
import { InjectModel } from '@nestjs/mongoose';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PostModel, PostModelName } from '../../domain/post.entity';
import { BlogsQueryRepository } from '../../../blogs/infrastracture/query-repo';
import { CreatePostInputDto } from '../../api/input-dto/post.input-dto';

export class CreatePostCommand {
  constructor(public dto: CreatePostInputDto) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostUseCase implements ICommandHandler<
  CreatePostCommand,
  string
> {
  constructor(
    @InjectModel(PostModelName) private PostModel: PostModel,
    private postsRepo: PostsRepository,
    private blogsQueryRepo: BlogsQueryRepository,
  ) {}

  async execute({ dto }: CreatePostCommand) {
    const blog = await this.blogsQueryRepo.getById(dto.blogId);
    const post = this.PostModel.createPost({ ...dto, blogName: blog.name });
    await this.postsRepo.savePost(post);
    return post._id.toString();
  }
}
