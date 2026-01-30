import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { TestingModule } from './testing/testing.module';
import { CoreModule } from './core/core.module';
import { UserModelName, UserSchema } from './modules/users/domain/user.entity';
import { UserModule } from './modules/users/user.module';
import { BlogPlatformModule } from './modules/blogs-platform/blog-platform.module';

@Module({
  imports: [
    CoreModule,
    MongooseModule.forRoot('mongodb://127.0.0.1'),
    MongooseModule.forFeature([{ name: UserModelName, schema: UserSchema }]),
    TestingModule,
    UserModule,
    BlogPlatformModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
