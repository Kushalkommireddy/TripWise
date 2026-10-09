import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// A short connection timeout means a genuinely unreachable database (wrong
// URL, network blocking the port, Neon project paused/deleted) fails in a
// few seconds with a clear ETIMEDOUT, instead of the default hanging for
// 20+ seconds before giving up — much easier to diagnose either way.
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
});

export const db = drizzle(pool, { schema });
