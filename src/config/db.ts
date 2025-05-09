import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../models/schema';
import * as dotenv from 'dotenv';

dotenv.config();

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for NeonDB connections
  }
});

// Initialize Drizzle with the schema
export const db = drizzle(pool, { schema });

// Export pool for direct access if needed
export { pool }; 