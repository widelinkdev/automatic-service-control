import { describe, it, expect, vi, beforeAll } from 'vitest';
import prisma from '../../prisma.js';
import { createApp } from '../../app.js';

let app: any;

describe('Generic Webhook Routes', () => {
  beforeAll(async () => {
    app = await createApp();
  });

  it('should return 200 for unknown webhook routes', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/webhook/unknown',
      payload: { test: 'data' },
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.ok).toBe(true);
    expect(body.id).toBeDefined();

    // Verify the event was actually saved to the database
    const savedEvent = await prisma.webhookEvent.findUnique({
      where: { id: body.id },
    });

    expect(savedEvent).toBeDefined();
    expect(savedEvent?.source).toBe('unknown');
    expect(savedEvent?.status).toBe('WAITING');
    expect(savedEvent?.payload).toEqual({ test: 'data' });
  });

  it('should handle database errors gracefully', async () => {
    // Temporarily disconnect from database to simulate an error
    await prisma.$disconnect();

    // Mock the prisma operation to throw an error
    const originalCreate = prisma.webhookEvent.create;
    prisma.webhookEvent.create = vi
      .fn()
      .mockRejectedValue(new Error('Database connection lost'));

    const testPayload = {
      data: {
        transaction: {
          id: 'test-transaction-id',
          status: 'APPROVED',
        },
      },
      signature: {
        checksum: 'test-checksum',
        properties: ['transaction.id', 'transaction.status'],
      },
      timestamp: Date.now(),
    };

    const response = await app.inject({
      method: 'POST',
      url: '/webhook/unknown',
      payload: testPayload,
      headers: {
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(500);

    const body = JSON.parse(response.body);
    expect(body.error).toBeDefined();

    // Restore the original function and reconnect for subsequent tests
    prisma.webhookEvent.create = originalCreate;
    await prisma.$connect();
  });
});
