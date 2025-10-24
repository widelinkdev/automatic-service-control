import { FastifyPluginAsync } from 'fastify';
import websocket from '@fastify/websocket';
import prisma from '../../prisma.js';
import { TaskStatus } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const pgmq_queue: string = process.env.RECONNECTION_PGMQ_QUEUE!;
const routes: FastifyPluginAsync = async fastify => {

  await fastify.register(websocket);

  fastify.get('/PaymentTaskLog/tasks', {
    schema: {
      description: 'List all task logs',
      querystring: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: Object.values(TaskStatus),
          },
          limit: { type: 'number', default: 20 },
        },
      },
    },
  }, async (request, reply) => {
    const { status, limit } = request.query as { status?: TaskStatus; limit?: number };

    const where = status ? { status } : {};
    const tasks = await prisma.paymentTaskLog.findMany({
      where,
      take: limit ?? 20,
      orderBy: { executedAt: 'desc' },
    });

    return tasks;
  });


  fastify.get('/PaymentTaskLog/:id', {
    schema: {
      description: 'Get task details by ID',
      params: {
        type: 'object',
        properties: {
          id: { type: 'string' },
        },
        required: ['id'],
      },
    },
  }, async (request, reply) => {
    const { id } = request.params as { id: string };

    const task = await prisma.paymentTaskLog.findUnique({
      where: { id },
      include: {
        paymentEvent: true,
      },
    });

    if (!task) {
      return reply.code(404).send({ error: 'Task not found' });
    }

    return task;
  });


  fastify.get('/queues', async (_req, _reply) => {

    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM pgmq.metrics_all();
    `);

    const queues = rows.map(row => ({
      queueName: row.queue_name,
      queueLength: Number(row.queue_length),
      totalMessages: Number(row.total_messages),
      newestMsgAgeSec: row.newest_msg_age_sec,
      oldestMsgAgeSec: row.oldest_msg_age_sec,
      scrapeTime: row.scrape_time,
    }));

    return { count: queues.length, queues };

  });


  fastify.get('/list/by-queue', {
    schema: {
      description: 'List pending messages in a specific queue',
      querystring: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          limit: { type: 'number', default: 20 },
        },
        required: ['name'],
      },
    },
  }, async (req, reply) => {

    const { name, limit } = req.query as { name?: string; limit?: number };

    const rows = await prisma.$queryRawUnsafe<any[]>(`
      SELECT * FROM pgmq.read('${name}', 0, ${limit});
    `);
    //   const res = await prisma.$queryRawUnsafe<any[]>(`
    //   SELECT * FROM pgmq.metrics('${pgmq_queue}');
    // `);
    const tasks = rows.map(row => ({
      id: row.msg_id?.toString(),
      readCount: Number(row.read_ct),
      enqueuedAt: row.enqueued_at,
      payload: row.message,
    }));

    return { queue: name, count: tasks.length, tasks };

    // return res.map(row =>
    //   Object.fromEntries(
    //     Object.entries(row).map(([k, v]) => [
    //       k,
    //       typeof v === 'bigint' ? v.toString() : v,
    //     ])
    //   )
    // );
  });

  fastify.get('/logs', async (_req, _reply) => {
    const logPath = path.resolve('./logs/app.log');
    const data = await fs.promises.readFile(logPath, 'utf8');
    const lines = data.trim().split('\n');
    const lastLines = lines.slice(-100); // últimas 100 líneas

    const messages = lastLines.map(line => {
      try {
        const json = JSON.parse(line);
        return json.msg || '';
      } catch {
        return line;
      }
    });

    return messages;
  });


};

export default routes;
