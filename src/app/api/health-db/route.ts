import { NextResponse } from "next/server";
import { createPool } from "@vercel/postgres";
export const dynamic = "force-dynamic";

const pool = createPool({
  connectionString: process.env.POSTGRES_POSTGRES_URL!, // Neon (pooled)
});

export async function GET() {
  try {
    const r = await pool.sql`select 1 as ok`;
    return NextResponse.json({ ok: true, result: r.rows[0] });
  } catch (e) {
    const err = e as Error;
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

