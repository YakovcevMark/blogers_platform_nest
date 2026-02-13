import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appSetup } from './setup/app.setup';
const _PORT = process.env.PORT ?? 5001;
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  appSetup(app);
  await app.listen(_PORT);
  console.log('Server is listening on port ' + _PORT);
}
bootstrap();
