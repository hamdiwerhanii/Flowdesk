import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { Env, getAllowedOrigins } from './config/env.validation';
import { PrismaExceptionFilter } from './shared/filters/prisma-exception.filter';
import { SocketIoAdapter } from './web-socket/adapters/socket-io.adapter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService<Env, true>);

  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new PrismaExceptionFilter());
  const allowedOrigins = getAllowedOrigins(
    config.get('FRONTEND_URLS', { infer: true }),
  );
  app.enableCors({ origin: allowedOrigins, credentials: true });
  app.useWebSocketAdapter(new SocketIoAdapter(app, allowedOrigins));

  app.enableShutdownHooks();

  if (config.get('NODE_ENV', { infer: true }) !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Flowdesk API')
      .setDescription('Helpdesk SaaS: organizations, tickets, imports')
      .setVersion('1.0')
      .addCookieAuth('access_token')
      .build();
    SwaggerModule.setup(
      'api',
      app,
      SwaggerModule.createDocument(app, swaggerConfig),
    );
  }

  const port = config.get('PORT', { infer: true });
  await app.listen(port);
  Logger.log(`Flowdesk API listening on port ${port}`, 'Bootstrap');
}
void bootstrap();
