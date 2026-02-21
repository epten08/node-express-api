import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// `prisma generate` in CI does not need a live DB connection.
// Use a placeholder URL when DATABASE_URL is not provided.
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://postgres:postgres@localhost:5432/express_api?schema=public';

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
