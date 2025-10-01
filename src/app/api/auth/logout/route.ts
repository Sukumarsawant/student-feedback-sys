import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabaseServer";

export async function POST() {
  const supabase = await createSupabaseRouteHandlerClient();

  // Sign out and clear all auth cookies
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  // Return success with cache-control headers
  const response = NextResponse.json({ success: true });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
  
  return response;
}