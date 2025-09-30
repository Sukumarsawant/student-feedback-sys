import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get user profile to redirect to appropriate dashboard
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role === 'admin') {
    redirect('/admin');
  } else if (profile?.role === 'teacher') {
    redirect('/teacher');
  } else if (profile?.role === 'student') {
    redirect('/student');
  } else {
    redirect('/login');
  }
}

