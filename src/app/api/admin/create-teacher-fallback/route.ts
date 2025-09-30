import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Disable Edge Runtime for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // For development/testing without service role key
    return NextResponse.json({ 
      message: "Teacher creation temporarily disabled for deployment. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.",
      error: "Service role key required"
    }, { status: 503 });

  } catch (error: any) {
    console.error('Teacher creation error:', error);
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}