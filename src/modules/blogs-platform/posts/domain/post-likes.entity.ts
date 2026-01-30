import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Like } from '../../../../core/dto/base.like.dto';
import { HydratedDocument, Model } from 'mongoose';
import { CommentLikeDomainInputDto } from '../../comments/domain/dto/create-comment-like-domain.input-dto';
import { CommentLikeDocument } from '../../comments/domain/comment-like.entity';
import { PostLikeDomainInputDto } from './dto/create-post-like-domain.input-dto';

@Schema({ timestamps: true })
export class PostLike extends Like {
  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: String, required: true })
  login: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createLike(dto: PostLikeDomainInputDto) {
    const postLike = new this();
    postLike.postId = dto.postId;
    postLike.userId = dto.userId;
    postLike.status = dto.status;
    postLike.login = dto.login;
    return postLike as PostLikeDocument;
  }
}

export type PostLikeDocument = HydratedDocument<PostLike>;
export const PostLikeSchema = SchemaFactory.createForClass(PostLike);
PostLikeSchema.loadClass(PostLike);
export type PostLikeModel = Model<PostLikeDocument> & typeof PostLike;
export const PostLikeModelName = PostLike.name;
