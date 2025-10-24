import { describe, it, expect, beforeAll } from 'vitest';
import prisma from '../../prisma.js';
import { createApp } from '../../app.js';

let app: any;

describe('UISP Webhook Routes', () => {
  beforeAll(async () => {
    app = await createApp();
  });

  it('should process uisp webhook and save event', async () => {
    const url = '/webhook/uisp';
    const testPayload = { test: 'data', event: 'customer.created' };

    const response = await app.inject({
      method: 'POST',
      url: url,
      payload: testPayload,
      headers: {
        'content-type': 'application/json',
      },
    });

    const body = JSON.parse(response.body);

    expect(response.statusCode).toBe(200);
    expect(body.ok).toBe(true);
    expect(body.id).toBeDefined();

    // Verify the event was actually saved to the database
    const savedEvent = await prisma.webhookEvent.findUnique({
      where: { id: body.id },
    });

    expect(savedEvent).toBeDefined();
    expect(savedEvent?.source).toBe('uisp');
    expect(savedEvent?.status).toBe('WAITING');
    expect(savedEvent?.payload).toEqual(testPayload);
  });
});
