import { InjectModel } from '@nestjs/mongoose';
import {
  CommentDocument,
  CommentModel,
  CommentModelName,
} from '../domain/comment.entity';
import { Injectable } from '@nestjs/common';
import { ObjectId } from 'mongodb';
import {
  CommentLikeDocument,
  CommentLikeModel,
  CommentLikeModelName,
} from '../domain/comment-like.entity';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectModel(CommentModelName) private readonly CommentModel: CommentModel,
    @InjectModel(CommentLikeModelName)
    private readonly CommentLikeModel: CommentLikeModel,
  ) {}

  async getById(id: string): Promise<CommentDocument | null> {
    return this.CommentModel.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const response = await this.CommentModel.deleteOne({
      _id: new ObjectId(id),
    });
    return response.deletedCount > 0;
  }

  async getLikeRecord(
    commentId: string,
    userId: string,
  ): Promise<CommentLikeDocument | null> {
    return this.CommentLikeModel.findOne({ commentId, userId });
  }

  async saveLikeRecord(like: CommentLikeDocument) {
    await like.save();
  }
  async saveComment(comment: CommentDocument) {
    await comment.save();
  }
}
