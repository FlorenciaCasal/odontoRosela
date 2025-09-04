import { drizzle } from "drizzle-orm/vercel-postgres";
import { createPool } from "@vercel/postgres";

// Usamos la variable que vos ya tenés en local y Vercel:
const pool = createPool({
  connectionString: process.env.POSTGRES_POSTGRES_URL!, // Neon (pooled)
});

export const db = drizzle(pool);

