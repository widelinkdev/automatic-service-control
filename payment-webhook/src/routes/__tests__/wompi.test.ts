import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import prisma from '../../prisma.js';
import { createApp } from '../../app.js';

// Create hoisted mock for wompi verification
const mockVerifyEventIntegrity = vi.hoisted(() => vi.fn());

// Mock the signature verification module
vi.mock('../../functions/wompi/verify.js', () => ({
  verifyEventIntegrity: mockVerifyEventIntegrity,
}));

// Test environment variables
process.env.WOMPI_SECRET = 'test_events_M2BqfP13msiy0HEz9GFkqrlmbf7jlfZf';

let app: any;

describe('Wompi Webhook Routes', () => {
  beforeAll(async () => {
    app = await createApp();
  });

  beforeEach(() => {
    // Reset and configure the mock before each test
    mockVerifyEventIntegrity.mockReturnValue(true);
    mockVerifyEventIntegrity.mockClear();
  });

  it('should process wompi webhook and save event', async () => {
    const url = '/webhook/wompi';
    const testPayload = {
      data: {
        transaction: {
          id: 'test-transaction-id',
          status: 'APPROVED',
          reference: 'test-reference',
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
      url: url,
      payload: testPayload,
      headers: {
        'x-event-checksum': testPayload.signature.checksum,
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
    expect(savedEvent?.source).toBe('wompi');
    expect(savedEvent?.status).toBe('WAITING');
    expect(savedEvent?.payload).toEqual(testPayload);
  });

  it('should validate wompi webhook signature', async () => {
    const url = '/webhook/wompi';
    const testPayload = {
      data: {
        transaction: {
          id: 'test-transaction-id',
          status: 'APPROVED',
        },
      },
      signature: {
        checksum: 'invalid-checksum',
        properties: ['transaction.id', 'transaction.status'],
      },
      timestamp: Date.now(),
    };

    const response = await app.inject({
      method: 'POST',
      url: url,
      payload: testPayload,
      headers: {
        'x-event-checksum': 'different-checksum',
        'content-type': 'application/json',
      },
    });

    // Should still process but with different checksum
    expect(response.statusCode).toBe(200);

    const body = JSON.parse(response.body);
    expect(body.ok).toBe(true);
    expect(body.id).toBeDefined();

    // Verify the event was actually saved to the database
    const savedEvent = await prisma.webhookEvent.findUnique({
      where: { id: body.id },
    });

    expect(savedEvent).toBeDefined();
    expect(savedEvent?.source).toBe('wompi');
  });

  it('should handle invalid wompi signature', async () => {
    // Configure mock to return false for invalid signature
    mockVerifyEventIntegrity.mockReturnValue(false);

    const url = '/webhook/wompi';
    const testPayload = {
      data: {
        transaction: {
          id: 'test-transaction-id',
          status: 'APPROVED',
        },
      },
      signature: {
        checksum: 'invalid-checksum',
        properties: ['transaction.id', 'transaction.status'],
      },
      timestamp: Date.now(),
    };

    const response = await app.inject({
      method: 'POST',
      url: url,
      payload: testPayload,
      headers: {
        'x-event-checksum': 'invalid-checksum',
        'content-type': 'application/json',
      },
    });

    expect(response.statusCode).toBe(400);

    const body = JSON.parse(response.body);
    expect(body.ok).toBe(false);
    expect(body.error).toBe('Invalid Wompi signature');
  });
});
