import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { AppModule } from './app.module';
import { SpaFallbackFilter } from './spa.filter';

function resolveWebRoot(): string | null {
  const candidates = [
    join(__dirname, '..', '..', 'web', 'dist', 'web', 'browser'),
    join(__dirname, '..', '..', 'web', 'dist', 'browser'),
    join(process.cwd(), 'apps', 'web', 'dist', 'web', 'browser'),
    join(process.cwd(), 'apps', 'web', 'dist', 'browser'),
    join(process.cwd(), '..', 'web', 'dist', 'web', 'browser'),
  ];
  return candidates.find((p) => existsSync(join(p, 'index.html'))) || null;
}

async function bootstrap() {
  mkdirSync(join(process.cwd(), 'data'), { recursive: true });
  mkdirSync('/workspace/data', { recursive: true });

  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalFilters(new SpaFallbackFilter());

  const webRoot = resolveWebRoot();
  if (webRoot) {
    app.useStaticAssets(webRoot);
    console.log(`Serving Angular from ${webRoot}`);
  }

  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);
  console.log(`ForgeLedger API listening on http://${host}:${port}`);
}

bootstrap();
