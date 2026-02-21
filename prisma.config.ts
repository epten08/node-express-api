import 'dotenv/config';
import { defineConfig } from 'prisma/config';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error('DATABASE_URL is required for Prisma operations.');
}

export default defineConfig({
  earlyAccess: true,
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
  migrate: {
    url: databaseUrl,
  },
  studio: {
    url: databaseUrl,
  },
});
