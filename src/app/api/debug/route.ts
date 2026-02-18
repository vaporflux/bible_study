import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.OPENAI_API_KEY;
  return NextResponse.json({
    keyExists: !!key,
    keyLength: key ? key.length : 0,
    keyPrefix: key ? key.substring(0, 7) + "..." : "not set",
    nodeEnv: process.env.NODE_ENV,
  });
}
