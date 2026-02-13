import { Global, Module } from '@nestjs/common';
import { BcryptService } from './application/bcrypt.service';
import { SmtpService } from './application/smtp.service';
import { SmtpManager } from './application/smpt.manager';
import { CqrsModule } from '@nestjs/cqrs';

@Global()
@Module({
  imports: [CqrsModule],
  providers: [BcryptService, SmtpService, SmtpManager],
  exports: [BcryptService, SmtpService, SmtpManager, CqrsModule],
})
export class CoreModule {}
