import { NextResponse } from "next/server";
import type { HealthResponse } from "@cwad/types";
import { healthResponseSchema } from "@cwad/validation";

export const dynamic = "force-dynamic";

export function GET() {
  const payload: HealthResponse = {
    status: "ok",
    service: "next-web",
    timestamp: new Date().toISOString(),
  };

  const validated = healthResponseSchema.parse(payload);

  return NextResponse.json(validated, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}