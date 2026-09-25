import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { configuration } from './config/configuration';
import { validateEnvironment } from './config/env.schema';
import { JwtAuthGuard } from './common/auth/jwt-auth.guard';
import { RequestIdMiddleware } from './common/http/request-id.middleware';
import { ProblemDetailsFilter } from './common/http/problem-details.filter';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { ProjectsModule } from './projects/projects.module';
import { CatalogModule } from './catalog/catalog.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { ProjectConfigModule } from './project-config/project-config.module';
import { randomUUID } from 'node:crypto';
import { AuthModule } from './auth/auth.module';
import { CsrfGuard } from './auth/csrf.guard';

@Module({
  controllers: [],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true, load: [configuration], validate: validateEnvironment }),
    JwtModule.register({ global: true }),
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [{ ttl: config.getOrThrow<number>('rateLimit.ttlMs'), limit: config.getOrThrow<number>('rateLimit.defaultLimit') }],
    }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        pinoHttp: {
          level: config.get<string>('logging.level') ?? 'info',
          redact: { paths: ['req.headers.authorization', 'req.headers.cookie', 'req.body.password', 'req.body.token', 'res.headers["set-cookie"]'], censor: '[REDACTED]' },
          genReqId: (request) => request.headers['x-request-id']?.toString() ?? randomUUID(),
        },
      }),
    }),
    DatabaseModule,
    AuthModule,
    HealthModule,
    ProjectsModule,
    CatalogModule,
    SuppliersModule,
    ProjectConfigModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    { provide: APP_FILTER, useClass: ProblemDetailsFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes({ path: '{*path}', method: RequestMethod.ALL });
  }
}
