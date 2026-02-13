import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { UpdateBlogDto } from '../api/input-dto/update-blog.input-dto';
import { CreateBlogDomainDto } from './dto/create-blog-domain.input-dto';
import { HydratedDocument, Model } from 'mongoose';

export const nameConstraints = {
  minLength: 1,
  maxLength: 15,
};
export const descriptionConstraints = {
  minLength: 1,
  maxLength: 500,
};
export const websiteUrlConstraints = {
  minLength: 1,
  maxLength: 500,
  match: [
    /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    'Пожалуйста, заполните корректный URL',
  ] as [RegExp, string],
};

@Schema({ timestamps: true })
export class Blog {
  /**
   * The name: of Blog
   * @type {String}
   */
  @Prop({ type: String, required: true, ...nameConstraints })
  name: string;
  /**
   * The description of Blog
   * @type {String}
   */
  @Prop({ type: String, required: true, ...descriptionConstraints })
  description: string;
  /**
   * The websiteUrl of Blog
   * @type {String}
   */
  @Prop({ type: String, required: true, ...websiteUrlConstraints })
  websiteUrl: string;

  /**
   * Creation timestamp
   * Explicitly defined despite timestamps: true
   * properties without @Prop for typescript so that they are in the class instance (or in instance methods)
   * @type {Date}
   */
  createdAt: Date;
  updatedAt: Date;

  @Prop({ type: Boolean, required: true })
  isMembership: boolean;

  update(dto: UpdateBlogDto) {
    const { websiteUrl, description, name } = dto;
    this.name = name;
    this.description = description;
    this.websiteUrl = websiteUrl;
  }

  static createBlog(dto: CreateBlogDomainDto): BlogDocument {
    const { websiteUrl, description, name } = dto;
    const blog = new this();
    blog.name = name;
    blog.description = description;
    blog.websiteUrl = websiteUrl;
    blog.isMembership = false;
    return blog as BlogDocument;
  }
}

export type BlogDocument = HydratedDocument<Blog>;
export const BlogSchema = SchemaFactory.createForClass(Blog);
BlogSchema.loadClass(Blog);
export type BlogModel = Model<BlogDocument> & typeof Blog;
export const BlogModelName = Blog.name;
