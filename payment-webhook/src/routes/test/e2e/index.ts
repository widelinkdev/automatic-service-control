import { FastifyRequest, FastifyReply, FastifyPluginAsync } from 'fastify';
import { Tail } from 'tail';
import { join } from 'path';

const handler = async (request: FastifyRequest, reply: FastifyReply) => {
  const { log } = request;

  const testPayload = {
    clientId: 400,
    amount: 50000,
    reference: `TEST-${new Date().toISOString().slice(0, 10)}`,
  };

  const continuous = request.query?.continuous === 'true';

  reply.raw.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  reply.raw.setHeader('Cache-Control', 'no-cache');
  reply.raw.setHeader('Connection', 'keep-alive');
  reply.raw.setHeader('X-Accel-Buffering', 'no');
  reply.hijack();

  const send = (msg: string) => {
    reply.raw.write(`data: ${msg}\n\n`);
  };

  try {
    log.info('🧪 [E2E TEST] Starting end-to-end test...');
    send('🧪 Starting E2E test...');

    // Ruta del log
    const logPath = join(process.cwd(), 'logs', 'app.log');
    log.info({ logPath }, '📁 Log file path resolved');

    // Escuchar logs en tiempo real
    log.info('👂 Setting up real-time log tail listener...');
    const tail = new Tail(logPath, { follow: true, useWatchFile: true });

    tail.on('line', (line) => {
      try {
        const json = JSON.parse(line);
        send(json.msg || line);
      } catch {
        send(line);
      }
    });

    tail.on('error', (err) => {
      log.error({ err }, '❌ Tail listener error');
      send(`❌ Tail error: ${err.message}`);
    });

    // Llamar al webhook
    const webhookUrl = `http://localhost:${process.env.PORT || 3000}/webhook/uisp/payments`;
    log.info({ webhookUrl, payload: testPayload }, '📨 Sending test webhook request...');

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        log.info({ status: response.status }, '✅ Webhook responded successfully');
        send(`✅ Webhook responded with status ${response.status}`);
      } else {
        log.error({ status: response.status }, '⚠️ Webhook responded with error');
        send(`⚠️ Webhook error: ${response.status}`);
      }
    } catch (err) {
      log.error({ err }, '❌ Error sending webhook request');
      send(`❌ Failed to send webhook: ${err instanceof Error ? err.message : err}`);
    }

    // Finalizar o dejar en modo continuo
    if (!continuous) {
      log.info('⏱️ Continuous mode disabled, stopping stream in 60s...');
      setTimeout(() => {
        log.info('🏁 [E2E TEST] Completed and closing connection.');
        tail.unwatch();
        send('🏁 Test completed.');
        reply.raw.end();
      }, 60000);
    } else {
      log.info('♾️ Continuous mode enabled — stream will remain open.');
      send('♾️ Continuous mode: live log stream running.');
    }

  } catch (error) {
    log.error({ error }, '❌ Unhandled error during E2E test');
    send(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    reply.raw.end();
  }
};

const routes: FastifyPluginAsync = async (fastify) => {
  fastify.get('/', handler);
};

export default routes;
