import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.timestamp({ format: 'HH:mm:ss' }),
            winston.format.colorize({ all: true }),
            winston.format.printf(
              ({ timestamp, level, message, context }) =>
                `${timestamp} [${context ?? 'App'}] ${level}: ${message}`,
            ),
          ),
        }),
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      ],
    }),
  });
  const logger = new Logger('Bootstrap');
  const configService = app.get(ConfigService);

  // Global Prefix
  app.setGlobalPrefix('api');

  // Security Headers
  app.use(helmet());

  // CORS Configuration
  const frontendUrl = configService.get<string>('FRONTEND_URL');
  app.enableCors({
    origin: frontendUrl ? [frontendUrl, 'http://localhost:3000'] : '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Global Pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global Interceptors
  app.useGlobalInterceptors(new ResponseInterceptor());

  // Global Filters are registered via APP_FILTER in app.module.ts

  // Shutdown Hooks for Prisma
  app.enableShutdownHooks();

  const port = configService.get<number>('PORT') || 3000;
  
  logger.log('--- RAILWAY STARTUP SEQUENCE ---');
  logger.log('1. Server boot start');
  logger.log(`2. Environment loaded. PORT: ${port}`);
  logger.log('3. Security headers (Helmet) & CORS configured');
  logger.log('4. Prisma & Database modules initialized via NestJS DI');
  
  await app.listen(port, '0.0.0.0');

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap().catch(err => {
  console.error(err);
  process.exit(1);
});
