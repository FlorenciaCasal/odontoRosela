import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";


export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const r = await sql`select 1 as ok`;
        return NextResponse.json({ ok: true, result: r.rows[0] });
    } catch (e) {
        const err = e as Error;
        return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
    }

}
