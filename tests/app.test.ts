import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

const app = createApp();

describe('Health Check', () => {
  it('should return 200 and status ok', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
    expect(response.body.timestamp).toBeDefined();
  });
});

describe('API Routes', () => {
  it('should return 404 for unknown routes', async () => {
    const response = await request(app).get('/api/v1/unknown');

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});

describe('Rate Limiting', () => {
  it('should have rate limit headers (draft-7 standard)', async () => {
    const response = await request(app).get('/health');

    // draft-7 uses lowercase headers
    const hasRateLimitHeaders =
      response.headers['ratelimit-limit'] !== undefined ||
      response.headers['ratelimit-policy'] !== undefined;

    expect(hasRateLimitHeaders).toBe(true);
  });
});
