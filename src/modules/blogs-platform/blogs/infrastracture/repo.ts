import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { BlogDocument, BlogModelName, BlogModel } from '../domain/blog.entity';

@Injectable()
export class BlogsRepository {
  constructor(@InjectModel(BlogModelName) private BlogModel: BlogModel) {}

  async getById(id: string): Promise<BlogDocument | null> {
    return this.BlogModel.findOne({ _id: new ObjectId(id) });
  }

  async remove(id: string): Promise<boolean> {
    const response = await this.BlogModel.deleteOne({ _id: new ObjectId(id) });
    return response.deletedCount > 0;
  }

  async save(blog: BlogDocument) {
    await blog.save();
  }
}
