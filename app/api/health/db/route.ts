import { NextResponse } from "next/server";

import { checkDatabaseConnection } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  try {
    await checkDatabaseConnection();

    return NextResponse.json({
      status: "ok",
      database: "connected",
    });
  } catch (error) {
    console.error("Falló la verificación de la base de datos:", error);

    return NextResponse.json(
      {
        status: "error",
        database: "unavailable",
      },
      { status: 503 },
    );
  }
}
