import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infrastructure/users.repo';
import { DomainNotFoundException } from '../../../../core/exceptions/domain-exceptions';

export class DeleteUserCommand {
  constructor(public userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserUseCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private usersRepo: UsersRepository) {}

  async execute({ userId }: DeleteUserCommand) {
    const isDeleted = await this.usersRepo.remove(userId);
    if (!isDeleted) throw new DomainNotFoundException('User not found');
  }
}
