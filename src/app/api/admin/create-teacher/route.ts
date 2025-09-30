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

    const { fullName, employeeId, department } = await request.json();

    if (!fullName || !employeeId || !department) {
      return NextResponse.json({ error: 'Full name, employee ID, and department are required' }, { status: 400 });
    }

    const teacherEmailDomain = process.env.NEXT_PUBLIC_TEACHER_EMAIL_DOMAIN || 'teachers.feedback.local';

    const firstName = fullName.trim().split(/\s+/)[0]?.toLowerCase() || '';
    const baseUsername = firstName.replace(/[^a-z0-9]/g, '');

    if (!baseUsername) {
      return NextResponse.json({ error: 'First name must contain alphabetic characters to generate credentials' }, { status: 400 });
    }

    if (baseUsername.length < 6) {
      return NextResponse.json({ error: 'First name must be at least 6 characters to satisfy password requirements' }, { status: 400 });
    }

    let username: string | null = null;
    let generatedEmail: string | null = null;
    let newUserId: string | null = null;
    let attempt = 0;
    const maxAttempts = 5;

    while (attempt < maxAttempts) {
      const candidateUsername = attempt === 0 ? baseUsername : `${baseUsername}${attempt + 1}`;
      const candidateEmail = `${candidateUsername}@${teacherEmailDomain}`;

      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: candidateEmail,
        password: candidateUsername,
        user_metadata: {
          full_name: fullName,
          role: 'teacher',
          employee_id: employeeId,
          department: department,
          username: candidateUsername
        },
        email_confirm: true
      });

      if (createError) {
        // Retry on duplicate email/username, otherwise surface the error
        if (createError.message.toLowerCase().includes('already registered')) {
          attempt += 1;
          continue;
        }

        return NextResponse.json({ error: createError.message }, { status: 400 });
      }

      if (!newUser.user) {
        return NextResponse.json({ error: 'Failed to create user account' }, { status: 500 });
      }

      username = candidateUsername;
      generatedEmail = candidateEmail;
      newUserId = newUser.user.id;
      break;
    }

    if (!username || !generatedEmail || !newUserId) {
      return NextResponse.json({ error: 'Could not generate unique credentials. Try a different first name variant.' }, { status: 409 });
    }

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        email: generatedEmail,
        full_name: fullName,
        role: 'teacher',
        employee_id: employeeId,
        department: department
      }, { onConflict: 'id' });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      await supabaseAdmin.auth.admin.deleteUser(newUserId);
      return NextResponse.json({ error: 'Failed to create teacher profile' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Teacher account created successfully for ${fullName}`,
      user: {
        id: newUserId,
        email: generatedEmail,
        full_name: fullName,
        employee_id: employeeId,
        department: department
      },
      credentials: {
        username,
        password: username
      }
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('Teacher creation error:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}