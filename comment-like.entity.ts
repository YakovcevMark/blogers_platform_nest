import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Like } from '../../../../core/dto/base.like.dto';
import { HydratedDocument, Model } from 'mongoose';
import { CommentLikeDomainInputDto } from './dto/create-comment-like-domain.input-dto';
import { LikeStatus } from '../../../../core/enums/like-status';

@Schema({ timestamps: true })
export class CommentLike extends Like {
  @Prop({ type: String, required: true })
  commentId: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  static createLike(dto: CommentLikeDomainInputDto) {
    const commentLike = new this();
    commentLike.commentId = dto.commentId;
    commentLike.userId = dto.userId;
    commentLike.status = dto.status;
    return commentLike as CommentLikeDocument;
  }
}

export type CommentLikeDocument = HydratedDocument<CommentLike>;
export const CommentLikeSchema = SchemaFactory.createForClass(CommentLike);
CommentLikeSchema.loadClass(CommentLike);
export type CommentLikeModel = Model<CommentLikeDocument> & typeof CommentLike;
export const CommentLikeModelName = CommentLike.name;
