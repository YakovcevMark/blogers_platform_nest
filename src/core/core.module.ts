import { Global, Module } from '@nestjs/common';
import { BcryptService } from './application/bcrypt.service';
import { SmtpService } from './application/smtp.service';
import { SmtpManager } from './application/smpt.manager';

@Global()
@Module({
  providers: [BcryptService, SmtpService, SmtpManager],
  exports: [BcryptService, SmtpService, SmtpManager],
})
export class CoreModule {}
