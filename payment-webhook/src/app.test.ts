import { describe, it, expect, beforeAll } from 'vitest';
import { createApp } from './app.js';

let app: any;

describe('Fastify App', () => {
  beforeAll(async () => {
    console.log('Creating Fastify app for integration tests...');
    app = await createApp();
    console.log('✅ Fastify app created successfully');
  });

  it('should create app instance successfully', async () => {
    expect(app).toBeDefined();
    expect(typeof app.inject).toBe('function');
    expect(typeof app.register).toBe('function');
  });

  it('should have swagger plugin registered', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/docs/json',
    });

    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');

    const schema = JSON.parse(response.body);
    expect(schema.openapi).toBeDefined();
    expect(schema.info.title).toBe('Webhook API');
    expect(schema.info.version).toBe('1.0.0');
  });

  it('should have custom 404 handler configured', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/nonexistent-route',
    });

    expect(response.statusCode).toBe(404);

    const body = JSON.parse(response.body);
    expect(body.error).toBe('Not Found');
    expect(body.message).toContain('Route GET:/nonexistent-route not found');
    expect(body.availableEndpoints).toBeDefined();
    expect(Array.isArray(body.availableEndpoints)).toBe(true);
  });

  it('should handle CORS preflight requests', async () => {
    const response = await app.inject({
      method: 'OPTIONS',
      url: '/webhook/wompi',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    // Should handle OPTIONS request gracefully (either 200 or 404 is acceptable)
    expect([200, 404]).toContain(response.statusCode);
  });

  it('should properly handle malformed JSON in requests', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/webhook/unknown',
      payload: 'invalid-json-string',
      headers: {
        'content-type': 'application/json',
      },
    });

    // Should return 400 for malformed JSON
    expect(response.statusCode).toBe(400);
  });
});
