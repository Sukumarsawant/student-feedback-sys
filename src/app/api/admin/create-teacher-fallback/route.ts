import { NextResponse } from "next/server";

// Disable Edge Runtime for this API route
export const runtime = 'nodejs';

export async function POST() {
  try {
    // For development/testing without service role key
    return NextResponse.json({ 
      message: "Teacher creation temporarily disabled for deployment. Please add SUPABASE_SERVICE_ROLE_KEY to environment variables.",
      error: "Service role key required"
    }, { status: 503 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Teacher creation error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}