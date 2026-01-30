import { Injectable } from '@nestjs/common';
import { PostDocument, PostModel, PostModelName } from '../domain/post.entity';
import { InjectModel } from '@nestjs/mongoose';
import {
  PostLikeDocument,
  PostLikeModel,
  PostLikeModelName,
} from '../domain/post-likes.entity';
import { ObjectId } from 'mongodb';
import { LikeStatus } from '../../../../core/enums/like-status';

@Injectable()
export class PostsRepository {
  constructor(
    @InjectModel(PostModelName) private readonly PostModel: PostModel,
    @InjectModel(PostLikeModelName)
    private readonly PostLikeModel: PostLikeModel,
  ) {}

  async getById(id: string): Promise<PostDocument | null> {
    return this.PostModel.findById(id);
  }

  async remove(id: string): Promise<boolean> {
    const response = await this.PostModel.deleteOne({ _id: new ObjectId(id) });
    return response.deletedCount > 0;
  }

  async getLikeRecord(
    postId: string,
    userId: string,
  ): Promise<PostLikeDocument | null> {
    return this.PostLikeModel.findOne({ postId, userId });
  }

  async getLastLikes(
    postId: string,
    count: number,
  ): Promise<PostLikeDocument[]> {
    return this.PostLikeModel.find({ postId, status: LikeStatus.Like })
      .sort({ createdAt: -1 })
      .limit(count);
  }

  async saveLikeRecord(like: PostLikeDocument) {
    await like.save();
  }

  async savePost(post: PostDocument) {
    await post.save();
  }
}
