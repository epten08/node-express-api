import { beforeAll, afterAll } from 'vitest';

beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret-key-that-is-at-least-32-chars';
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';
});

afterAll(() => {
  // Cleanup if needed
});
