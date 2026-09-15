import './telemetry';

import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import type { Request, Response, NextFunction } from 'express';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableShutdownHooks();
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));

  app.setGlobalPrefix('api');

  // Garde d'accès sur l'endpoint MCP : exige un token secret.
  // Si MCP_AUTH_TOKEN n'est pas défini, l'endpoint reste ouvert (dev local).
  const mcpToken = process.env.MCP_AUTH_TOKEN;
  app.use('/api/mcp', (req: Request, res: Response, next: NextFunction) => {
    if (!mcpToken) return next();
    const authHeader = req.headers['authorization'];
    const bearer =
      typeof authHeader === 'string' && authHeader.startsWith('Bearer ')
        ? authHeader.slice(7)
        : undefined;
    const apiKey = req.headers['x-api-key'];
    if (bearer === mcpToken || apiKey === mcpToken) return next();
    res.status(401).json({
      jsonrpc: '2.0',
      error: { code: -32001, message: 'Unauthorized.' },
      id: null,
    });
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  Logger.log(
    `Cookidoo MCP server listening on http://localhost:${port}/api/mcp`,
    'Bootstrap',
  );
}
bootstrap().catch((error: unknown) => {
  Logger.error('Failed to start Cookidoo MCP server', error, 'Bootstrap');
  process.exit(1);
});
