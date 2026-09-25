import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { loadSecureEnvironment } from './config/secure-env';
import { json } from 'express';
import cookieParser from 'cookie-parser';

async function bootstrap(): Promise<void> {
  loadSecureEnvironment();
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const config = app.get(ConfigService);
  app.useLogger(app.get(Logger));
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cookieParser());
  app.enableCors({ origin: config.getOrThrow<string[]>('cors.origins'), credentials: true, methods: ['GET', 'POST', 'PATCH', 'DELETE'] });
  app.use(json({ limit: '1mb' }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, stopAtFirstError: false }));
  app.setGlobalPrefix(config.getOrThrow<string>('app.prefix'));

  const swaggerConfig = new DocumentBuilder()
    .setTitle('BOMzeika Obras API')
    .setDescription('Tela interativa para validar APIs e payloads. Dados reais dependem de autenticação e banco migrado.')
    .setVersion('0.1.0')
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT', description: 'Use o token gerado por npm run token:dev em desenvolvimento.' })
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, { swaggerOptions: { persistAuthorization: false, displayRequestDuration: true, filter: true }, customSiteTitle: 'BOMzeika Obras · Teste de APIs' });

  await app.listen(config.getOrThrow<number>('app.port'), '127.0.0.1');
}

void bootstrap();
