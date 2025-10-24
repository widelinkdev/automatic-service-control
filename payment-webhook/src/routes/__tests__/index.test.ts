import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from '../../app.js';

let app: any;

describe('API Root Routes', () => {
  beforeAll(async () => {
    app = await createApp();
  });

  it('should serve API information at root endpoint', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.name).toBe('Webhook Router API');
    expect(body.version).toBe('1.0.0');
    expect(body.status).toBe('running');
  });

  it('should serve swagger documentation', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('text/html');
  });

  it('should serve API documentation JSON', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    const schema = JSON.parse(response.body);
    expect(schema.openapi).toBeDefined();
    expect(schema.paths).toBeDefined();
  });

  it('should handle 404 for unknown routes', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/unknown-route',
    });

    expect(response.statusCode).toBe(404);

    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not Found');
    expect(body.message).toContain('Route GET:/unknown-route not found');
    expect(body.availableEndpoints).toEqual(['GET /', 'GET /health']);
  });
});
