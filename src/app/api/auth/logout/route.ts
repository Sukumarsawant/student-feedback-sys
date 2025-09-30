import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabaseServer";

export async function POST() {
  const supabase = await createSupabaseRouteHandlerClient();

  await supabase.auth.signOut();

  return NextResponse.json({ success: true });
}