import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = nanoid(32); // Random 32-character key

  // TODO: Save apiKey to database associated with user session or ID

  return NextResponse.json({ apiKey });
}
