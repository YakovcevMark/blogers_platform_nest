import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PostModel, PostModelName } from '../domain/post.entity';
import { PostLikeModel, PostLikeModelName } from '../domain/post-likes.entity';
import { GetPostsQueryParams } from '../api/input-dto/get-posts-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { PostViewDto } from '../api/view-dto/posts.view-dto';
import { getDbFilters } from '../../../../core/utils/get-db-filters';
import { DomainNotFoundException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class PostsQueryRepository {
  constructor(
    @InjectModel(PostModelName) private readonly PostModel: PostModel,
    @InjectModel(PostLikeModelName)
    private readonly PostLikeModel: PostLikeModel,
  ) {}

  public getAll = async (
    query: GetPostsQueryParams & { userId?: string },
  ): Promise<PaginatedViewDto<PostViewDto[]>> => {
    const { blogId, userId, pageNumber, pageSize, sortDirection, sortBy } =
      query;
    const items = await this.PostModel.find(
      getDbFilters<PostViewDto>([{ fieldName: 'blogId', queryParam: blogId }]),
    )
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.getCount({ blogId });

    const likeRecords = await this.PostLikeModel.find({
      postId: items.map((post) => String(post._id)),
      userId,
    }).lean();

    const parsedItems = items.map((post) => {
      const currentSessionUserRecord = likeRecords.find(
        (record) =>
          record.userId === userId && record.postId === String(post._id),
      );
      return PostViewDto.mapToView(post, currentSessionUserRecord);
    });

    return PaginatedViewDto.mapToView({
      pageSize,
      items: parsedItems,
      page: pageNumber,
      totalCount,
    });
  };

  public getCount = async (
    params: Pick<GetPostsQueryParams, 'blogId'>,
  ): Promise<number> => {
    const { blogId } = params;
    return this.PostModel.countDocuments(
      getDbFilters<PostViewDto>([
        {
          fieldName: 'blogId',
          queryParam: blogId,
        },
      ]),
    );
  };

  public getById = async (
    id: string,
    userId?: string,
  ): Promise<PostViewDto | null> => {
    const entity = await this.PostModel.findById(id).lean();
    if (!entity)
      throw new DomainNotFoundException('Post with given id not found');
    const currentSessionUserRecord = await this.PostLikeModel.findOne({
      postId: id,
      userId,
    }).lean();
    return PostViewDto.mapToView(entity, currentSessionUserRecord);
  };
}
