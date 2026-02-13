import { Injectable } from '@nestjs/common';
import { GetCommentsQueryParams } from '../api/input-dto/get-comments-query-params.input-dto';
import { getDbFilters } from '../../../../core/utils/get-db-filters';
import {
  CommentDocument,
  CommentModel,
  CommentModelName,
} from '../domain/comment.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { CommentViewDto } from '../api/view-dto/comment.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import {
  CommentLikeDocument,
  CommentLikeModel,
  CommentLikeModelName,
} from '../domain/comment-like.entity';
import { LikeStatus } from '../../../../core/enums/like-status';
import { DomainNotFoundException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class CommentsQueryRepository {
  constructor(
    @InjectModel(CommentModelName) private readonly CommentModel: CommentModel,
    @InjectModel(CommentLikeModelName)
    private readonly CommentLikeModel: CommentLikeModel,
  ) {}

  private getListFilter = (params: Pick<GetCommentsQueryParams, 'postId'>) => {
    const { postId } = params;
    return getDbFilters<CommentDocument>([
      { fieldName: 'postId', queryParam: postId, isStrictEqual: true },
    ]);
  };

  public getAll = async (
    query: GetCommentsQueryParams,
    userId?: string,
  ): Promise<PaginatedViewDto<CommentViewDto[]>> => {
    const { postId, sortBy, sortDirection, pageSize, pageNumber } = query;

    const items = await this.CommentModel.find(this.getListFilter({ postId }))
      .sort({ [sortBy]: sortDirection })
      .skip(query.calculateSkip())
      .limit(pageSize)
      .lean();

    const totalCount = await this.getCount({ postId });

    const likeRecords = await this.CommentLikeModel.find({
      commentId: items.map((comment) => String(comment._id)),
    }).lean();

    const mapWithLikes: Record<string, CommentLikeDocument[]> = {};

    likeRecords.forEach((likeRecord) => {
      if (!mapWithLikes[likeRecord.commentId]) {
        mapWithLikes[likeRecord.commentId] = [];
      }
      mapWithLikes[likeRecord.commentId].push(likeRecord);
    });

    const parsedItems = items.map((comment) => {
      let likesCount = 0,
        dislikeCount = 0,
        currentUserStatus = LikeStatus.None;
      mapWithLikes[String(comment._id)].forEach((record) => {
        if (record.status === LikeStatus.Like) likesCount++;
        if (record.status === LikeStatus.Dislike) dislikeCount++;
        if (record.userId === userId) currentUserStatus = record.status;
      });

      return CommentViewDto.mapToView(
        comment,
        likesCount,
        dislikeCount,
        currentUserStatus,
      );
    });

    return PaginatedViewDto.mapToView({
      pageSize,
      items: parsedItems,
      page: pageNumber,
      totalCount,
    });
  };

  public getCount = async (
    params: Partial<Pick<GetCommentsQueryParams, 'postId'>>,
  ): Promise<number> => {
    const { postId } = params;
    return this.CommentModel.countDocuments(
      this.getListFilter({
        postId,
      }),
    );
  };

  public getById = async (
    id: string,
    userId?: string,
  ): Promise<CommentViewDto | null> => {
    const entity = await this.CommentModel.findById(id).lean();
    if (!entity) throw new DomainNotFoundException('Comment not found');

    const likeRecords = await this.CommentLikeModel.find({
      commentId: String(entity._id),
    }).lean();

    let likesCount = 0,
      dislikeCount = 0,
      currentUserStatus = LikeStatus.None;

    likeRecords.forEach((record) => {
      if (record.status === LikeStatus.Like) likesCount++;
      if (record.status === LikeStatus.Dislike) dislikeCount++;
      if (record.userId === userId) currentUserStatus = record.status;
    });

    return CommentViewDto.mapToView(
      entity,
      likesCount,
      dislikeCount,
      currentUserStatus,
    );
  };
}
