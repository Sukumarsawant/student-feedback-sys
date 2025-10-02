import { NextResponse } from "next/server";
import { createSupabaseRouteHandlerClient } from "@/lib/supabaseServer";

export async function POST() {
  console.log('🚪 [LOGOUT API] Logout request received');
  
  try {
    const supabase = await createSupabaseRouteHandlerClient();
    console.log('✅ [LOGOUT API] Supabase client created');

    // Check current user before logout
    const { data: { user: beforeUser } } = await supabase.auth.getUser();
    console.log('📊 [LOGOUT API] Current user exists:', !!beforeUser);
    if (beforeUser) {
      console.log('👤 [LOGOUT API] User before logout:', beforeUser.email);
    }

    // Sign out and clear all auth cookies
    console.log('🔄 [LOGOUT API] Calling supabase.auth.signOut()');
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error('❌ [LOGOUT API] Logout error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
    
    console.log('✅ [LOGOUT API] Sign out successful');

    // Return success with cache-control headers
    const response = NextResponse.json({ success: true });
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    
    console.log('✅ [LOGOUT API] Returning success response');
    return response;
  } catch (err) {
    console.error('❌ [LOGOUT API] Unexpected error:', err);
    return NextResponse.json({ 
      success: false, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    }, { status: 500 });
  }
}