import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

// Disable Edge Runtime for this API route
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_key_for_build',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Simple authentication check for now
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'No valid authorization header' }, { status: 401 });
    }

    const { email, password, fullName, employeeId, department } = await request.json();

    // Validate input
    if (!email || !password || !fullName || !employeeId || !department) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    // Create the teacher user using admin client
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: {
        full_name: fullName,
        role: 'teacher',
        employee_id: employeeId,
        department: department
      },
      email_confirm: true
    });

    if (createError) {
      return NextResponse.json({ error: createError.message }, { status: 400 });
    }

    // Create profile manually
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: newUser.user.id,
        email: email,
        full_name: fullName,
        role: 'teacher',
        employee_id: employeeId,
        department: department
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      // Try to clean up the user if profile creation failed
      await supabaseAdmin.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json({ error: 'Failed to create teacher profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: `Teacher account created successfully for ${fullName}`,
      user: {
        id: newUser.user.id,
        email: newUser.user.email,
        full_name: fullName,
        employee_id: employeeId,
        department: department
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Teacher creation error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}