import { NextRequest, NextResponse } from "next/server";
import { generateAIPlaces } from "@/lib/ai-places";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const destination = searchParams.get("destination");
  if (!destination) return NextResponse.json({ error: "destination is required" }, { status: 400 });

  try {
    const result = await generateAIPlaces(destination);
    return NextResponse.json({ destination, ...result, source: "ai" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Could not generate places." }, { status: 502 });
  }
}
