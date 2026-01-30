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
} from '@nestjs/common';
import { UsersQueryRepository } from '../infrastructure/query-repo';
import { UserService } from '../application/users.service';
import { GetUsersQueryParams } from './input-dto/get-users-query-params.input-dto';
import { ApiParam } from '@nestjs/swagger';
import { CreateUserInputDto } from './input-dto/user.input-dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UserService,
  ) {}

  @Get()
  async getUsers(@Query() query: GetUsersQueryParams) {
    return this.usersQueryRepository.getAll(query);
  }

  @Post()
  async createUser(@Body() body: CreateUserInputDto) {
    const id = await this.usersService.create(body);
    return this.usersQueryRepository.getById(id);
  }

  @ApiParam({ name: 'id' }) //для сваггера
  @Delete(':id') //users/232342-sdfssdf-23234323
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUserById(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
