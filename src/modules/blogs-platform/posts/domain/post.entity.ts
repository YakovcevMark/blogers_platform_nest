import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CreatePostDomainDto } from './dto/create-post-domain.input-dto';
import { HydratedDocument, Model } from 'mongoose';
import { UpdatePostDto } from '../api/input-dto/update-post.input-dto';
import { LikeStatus } from '../../../../core/enums/like-status';
import { PostLikeDocument } from './post-likes.entity';

export const titleConstraints = {
  minLength: 1,
  maxLength: 30,
};
export const shortDescriptionConstraints = {
  minLength: 1,
  maxLength: 30,
};
export const contentConstraints = {
  minLength: 1,
  maxLength: 30,
};

@Schema({ _id: false })
class NewestLike {
  @Prop({ type: String, required: true })
  userId: string;

  @Prop({ type: String, required: true })
  login: string;

  @Prop({ type: Date, required: true })
  addedAt: Date;
}

export const NewestLikeSchema = SchemaFactory.createForClass(NewestLike);

@Schema({ _id: false })
class ExtendedLikes {
  @Prop({ type: Number, required: true, default: 0 })
  likesCount: number;
  @Prop({ type: Number, required: true, default: 0 })
  dislikesCount: number;
  @Prop({ type: [NewestLikeSchema], required: true, default: [] })
  newestLikes: NewestLike[];
}

export const ExtendedLikesSchema = SchemaFactory.createForClass(ExtendedLikes);

@Schema({ timestamps: true })
export class Post {
  /**
   * The title: of Post
   * @type {String}
   */
  @Prop({ type: String, required: true, ...titleConstraints })
  title: string;
  /**
   * The shortDescription of Post
   * @type {String}
   */
  @Prop({ type: String, required: true, ...shortDescriptionConstraints })
  shortDescription: string;
  /**
   * The content of Post
   * @type {String}
   */
  @Prop({ type: String, required: true, ...contentConstraints })
  content: string;

  /**
   * The id of blog
   * @type {String}
   */
  @Prop({ type: String, required: true })
  blogId: string;

  /**
   * The name of blog
   * @type {String}
   */
  @Prop({ type: String, required: true })
  blogName: string;

  @Prop({ type: ExtendedLikesSchema, required: true })
  extendedLikesInfo: ExtendedLikes;
  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  update(dto: UpdatePostDto) {
    const { content, shortDescription, title, blogId } = dto;
    this.content = content;
    this.shortDescription = shortDescription;
    this.title = title;
    this.blogId = blogId;
  }

  updateLikesInfo(newStatus: LikeStatus, currentStatus?: LikeStatus) {
    if (newStatus === LikeStatus.Like) {
      this.extendedLikesInfo.likesCount++;
      if (currentStatus === LikeStatus.Dislike) {
        this.extendedLikesInfo.dislikesCount--;
      }
    }
    if (newStatus === LikeStatus.Dislike) {
      this.extendedLikesInfo.dislikesCount++;
      if (currentStatus === LikeStatus.Like) {
        this.extendedLikesInfo.likesCount--;
      }
    }
    if (newStatus === LikeStatus.None) {
      if (currentStatus === LikeStatus.Dislike) {
        this.extendedLikesInfo.dislikesCount--;
      }
      if (currentStatus === LikeStatus.Like) {
        this.extendedLikesInfo.likesCount--;
      }
    }
  }

  setNewestLikes(likeRecords: PostLikeDocument[]) {
    this.extendedLikesInfo.newestLikes = likeRecords.map((likeRecords) => ({
      addedAt: likeRecords.createdAt,
      login: likeRecords.login,
      userId: likeRecords.userId,
    }));
  }

  static createPost(dto: CreatePostDomainDto): PostDocument {
    const { content, shortDescription, title, blogId, blogName } = dto;
    const post = new this();
    post.blogName = blogName;
    post.content = content;
    post.shortDescription = shortDescription;
    post.title = title;
    post.blogId = blogId;
    post.extendedLikesInfo = {
      likesCount: 0,
      dislikesCount: 0,
      newestLikes: [],
    };
    return post as PostDocument;
  }
}

export type PostDocument = HydratedDocument<Post>;
export const PostSchema = SchemaFactory.createForClass(Post);
PostSchema.loadClass(Post);
export type PostModel = Model<PostDocument> & typeof Post;
export const PostModelName = Post.name;
