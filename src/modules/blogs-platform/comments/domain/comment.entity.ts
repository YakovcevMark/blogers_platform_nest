import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Model } from 'mongoose';
import {
  CommentatorInfo,
  CommentatorInfoSchema,
} from '../../../../core/domain/commentator-info.entity';
import { UpdateCommentDto } from '../api/input-dto/update-comment.input-dto';
import { CommentDomainInputDto } from './dto/create-comment-domain.input-dto';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';

export const contentConstraints = {
  minLength: 20,
  maxLength: 300,
};

@Schema({ timestamps: true })
export class Comment {
  @Prop({ type: String, required: true })
  content: string;

  @Prop({ type: CommentatorInfoSchema, required: true })
  commentatorInfo: CommentatorInfo;

  @Prop({ type: String, required: true })
  postId: string;

  @Prop({ type: [String], required: true })
  likesIds: string[];

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  update(dto: UpdateCommentDto) {
    const { content } = dto;
    this.content = content;
  }

  addLikeId(id: string) {
    this.likesIds.push(id);
  }

  checkIsOwner(userId: string) {
    if (this.commentatorInfo.userId !== userId)
      throw new DomainException({
        code: DomainExceptionCode.Forbidden,
        message: 'You are not the author of this comment',
      });
  }

  static createComment(dto: CommentDomainInputDto): CommentDocument {
    const { content, commentatorInfo, postId } = dto;
    const comment = new this();
    comment.content = content;
    comment.commentatorInfo = commentatorInfo;
    comment.postId = postId;
    return comment as CommentDocument;
  }
}

export type CommentDocument = HydratedDocument<Comment>;
export const CommentSchema = SchemaFactory.createForClass(Comment);
CommentSchema.loadClass(Comment);
export type CommentModel = Model<CommentDocument> & typeof Comment;
export const CommentModelName = Comment.name;
