import Fastify from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import AutoLoad from '@fastify/autoload';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = Fastify();

  // Swagger documentation setup
  await app.register(swagger, {
    openapi: {
      info: {
        title: config.appName,
        version: config.appVersion,
      },
    },
  });

  await app.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'list',
      deepLinking: false,
    },
  });

  // Register all routes using autoload
  await app.register(AutoLoad, {
    dir: path.join(__dirname, 'routes'),
    options: {},
    ignorePattern: /(__tests__|\.test\.|\.spec\.)/,
    forceESM: true,
  });

  // Custom 404 handler
  app.setNotFoundHandler((request, reply) => {
    reply.status(404).send({
      error: 'Not Found',
      message: `Route ${request.method}:${request.url} not found`,
      statusCode: 404,
      availableEndpoints: ['GET /', 'GET /health'],
    });
  });

  return app;
}
