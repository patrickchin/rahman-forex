import { NextResponse } from "next/server";
import { getLatestBybit } from "@/lib/adverts";

export async function GET() {
  const data = await getLatestBybit();
  return NextResponse.json(data);
}
