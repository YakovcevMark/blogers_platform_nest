import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/users.query-repo';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { CreateUserInputDto } from './input-dto/user.input-dto';
import { BasicAuthGuard } from '../guards/basic-auth.guard';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateUserCommand } from '../application/usecases/create-user.usecase';
import { DeleteUserCommand } from '../application/usecases/delete-user.usecase';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { PaginatedViewDto } from '../../../core/dto/base.paginated.view-dto';
import { UserViewDto } from './view-dto/users.view-dto';
import { GetUserByIdQuery } from '../application/queries/get-user-by-id.query';

@UseGuards(BasicAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryParams) {
    return this.queryBus.execute<
      GetUsersQuery,
      PaginatedViewDto<UserViewDto[]>
    >(new GetUsersQuery(query));
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto) {
    const id = await this.commandBus.execute<CreateUserCommand, string>(
      new CreateUserCommand(body),
    );
    return this.queryBus.execute<GetUserByIdQuery, UserViewDto | null>(
      new GetUserByIdQuery(id),
    );
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id') //users/232342-sdfssdf-23234323
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: string) {
    return this.commandBus.execute<DeleteUserCommand>(
      new DeleteUserCommand(id),
    );
  }
}
