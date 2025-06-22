import { NextResponse } from "next/server";
import { getLatestGate } from "@/lib/adverts";

export async function GET() {
  const data = await getLatestGate();
  return NextResponse.json(data);
}
