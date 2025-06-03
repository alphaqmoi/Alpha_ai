import { nanoid } from "nanoid";
import { NextResponse } from "next/server";
import supabase from "@/lib/utils";

export async function GET() {
  const apiKey = nanoid(32); // Random 32-character key

  // Save apiKey to Supabase database
  const { data, error } = await supabase.from("api_keys").insert({
    api_key: apiKey,
    created_at: new Date().toISOString(),
  });

  if (error) {
    return NextResponse.json({ error: "Failed to save API key." }, { status: 500 });
  }
}
