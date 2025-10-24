import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import { TaskManager } from '../../../../lib/taskManager.js';
import prisma, { connectionString } from '../../../../prisma.js';
import { configure, tasks } from "@trigger.dev/sdk";
import { Prisma } from '@prisma/client';
import { Client } from 'pg';
import { logger } from '../../../../lib/logger.js';

configure({
  secretKey: process.env.TRIGGER_SECRET_KEY!,
});

const opts = {
  schema: {
    description: 'Webhook for receiving payment events from UISP',
    body: { type: 'object', additionalProperties: true },
    response: {
      200: {
        type: 'object',
        properties: {
          ok: { type: 'boolean' },
          id: { type: 'number' },
          taskLog: { type: 'object', additionalProperties: true }
        },
      },
    },
  },
};

const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const payload = request.body as Prisma.InputJsonValue;
    const source = 'uisp';

    // si payload no tiene clientId, rechazo la petición. Es obligatorio.
    if (typeof payload !== 'object' || payload === null || !('clientId' in payload)) {
      logger.warn('⚠️ Webhook received without clientId in payload, rejecting');
      return reply.code(400).send({
        error: 'Bad Request',
        message: 'clientId is required in payload',
      });
    }

    logger.info(`📩 Webhook received from UISP | source=${source} | payloadPreview=${JSON.stringify(payload).slice(0, 300)}`);

    const paymentEvent = await prisma.paymentEvent.create({
      data: {
        source: String(source),
        payload,
      },
    });
    logger.info(`💾 Payment event successfully saved | paymentEventId=${paymentEvent.id}`);
    // Inicio taskmanager
    const pgmq_queue: string = process.env.RECONNECTION_PGMQ_QUEUE!;
    const pgClient = new Client({ connectionString });
    const taskManager = new TaskManager(pgClient, pgmq_queue);
    await taskManager.init();

    logger.info(`⚙️ Task Manager initialized | queue=${pgmq_queue}`);

    // Crear tarea asociada al PaymentEvent
    const taskLog = await taskManager.createTask(paymentEvent.id);

    logger.info(`🧩 Task created | paymentEventId=${paymentEvent.id} | taskLogId=${taskLog.id} | pgmqMessageId=${taskLog.pgmqMessageId}`);

    return reply.code(200).send({
      ok: true,
      taskLog: taskLog,
    });

  } catch (error) {
    request.log.error('Error processing uisp webhook:', error);
    return reply.code(500).send({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

const routes: FastifyPluginAsync = async fastify => {
  fastify.post('/', opts, handler);
};

export default routes;
