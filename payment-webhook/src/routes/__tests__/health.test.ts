import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../../app.js';

let app: any;

describe('Health Routes', () => {
  beforeAll(async () => {
    app = await createApp();
  });

  it('should serve health check endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/health',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.status).toBe('healthy');
    expect(body.timestamp).toBeDefined();
    expect(body.uptime).toBeTypeOf('number');
  });
});
