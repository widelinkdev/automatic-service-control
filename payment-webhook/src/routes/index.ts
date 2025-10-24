import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import { config } from '../config.ts';

const opts = {
  schema: {
    description: 'API information',
    response: {
      200: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          version: { type: 'string' },
          status: { type: 'string' },
        },
      },
    },
  },
};

const handler = async (request: FastifyRequest) => {
  return {
    name: config.appName,
    version: config.appVersion,
    status: 'running',
    documentation: `${request.protocol}://${request.hostname}/docs`,
    endpoints: {
      webhooks: [
        'POST /webhook/payments/uisp',
      ],
      tasks: [
        'GET /tasks',
        'GET /tasks/:id',
        'GET /tasks/queue',
      ],
    },
  };
};

const routes: FastifyPluginAsync = async fastify => {
  fastify.get('/', opts, handler);
};

export default routes;
