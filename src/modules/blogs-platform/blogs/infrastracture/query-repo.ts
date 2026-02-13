import { ObjectId } from 'mongodb';
import { Injectable } from '@nestjs/common';
import { BlogViewDto } from '../api/view-dto/blogs.view-dto';
import { InjectModel } from '@nestjs/mongoose';
import { GetBlogsQueryParams } from '../api/input-dto/get-blogs-query-params.input-dto';
import { BlogModel, BlogModelName } from '../domain/blog.entity';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { getDbFilters } from '../../../../core/utils/get-db-filters';
import { DomainNotFoundException } from '../../../../core/exceptions/domain-exceptions';

@Injectable()
export class BlogsQueryRepository {
  constructor(@InjectModel(BlogModelName) private BlogModel: BlogModel) {}

  async getAll(
    query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    const items = await this.BlogModel.find(
      getDbFilters<BlogViewDto>([
        { fieldName: 'name', queryParam: query.searchNameTerm },
      ]),
    )
      .sort({ [query.sortBy]: query.sortDirection })
      .skip(query.calculateSkip())
      .limit(query.pageSize)
      .lean();

    const totalCount = await this.getCount({
      searchNameTerm: query.searchNameTerm,
    });

    return PaginatedViewDto.mapToView({
      pageSize: query.pageSize,
      items: items.map(BlogViewDto.mapToView),
      page: query.pageNumber,
      totalCount,
    });
  }

  async getCount(
    params: Partial<Pick<GetBlogsQueryParams, 'searchNameTerm'>>,
  ): Promise<number> {
    const { searchNameTerm } = params;
    return this.BlogModel.countDocuments(
      getDbFilters<BlogViewDto>([
        {
          fieldName: 'name',
          queryParam: searchNameTerm,
        },
      ]),
    );
  }

  async getById(id: string): Promise<BlogViewDto> {
    const blog = await this.BlogModel.findOne({ _id: new ObjectId(id) }).lean();
    if (!blog) throw new DomainNotFoundException('Blog not found');
    return BlogViewDto.mapToView(blog);
  }
}
