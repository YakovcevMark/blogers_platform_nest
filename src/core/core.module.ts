import { Global, Module } from '@nestjs/common';
import { BcryptService } from './application/bcrypt.service';
import { JwtService } from './application/jwt.service';

@Global()
@Module({
  providers: [BcryptService, JwtService],
  exports: [BcryptService, JwtService],
})
export class CoreModule {}
