import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL || '');
const host = dbUrl.hostname;
const port = dbUrl.port ? parseInt(dbUrl.port) : 5432;
const database = dbUrl.pathname.substring(1);
const username = dbUrl.username;
const password = dbUrl.password;

export default defineConfig({
  schema: './src/models/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    host,
    port,
    database,
    user: username,
    password,
    ssl: true,
  },
  verbose: true,
  strict: true,
}); 