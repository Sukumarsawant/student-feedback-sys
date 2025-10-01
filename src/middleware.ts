import { type NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: { headers: req.headers } });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => req.cookies.get(name)?.value,
        set: (name: string, value: string, options: Record<string, unknown> = {}) => {
          res.cookies.set({ name, value, ...options });
        },
        remove: (name: string, options: Record<string, unknown> = {}) => {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  // Auth pages - redirect if already logged in
  if (pathname.startsWith('/login') || pathname.startsWith('/admin-login')) {
    if (session?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      const userRole = (profile?.role || session.user.user_metadata?.role || 'student').toString().toLowerCase();
      
      if (userRole === 'admin') {
        return NextResponse.redirect(new URL('/admin', req.url));
      } else if (userRole === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', req.url));
      } else {
        return NextResponse.redirect(new URL('/student', req.url));
      }
    }
  }

  // Protected routes - redirect to login if not authenticated
  const protectedPaths = ['/feedback', '/admin', '/teacher', '/student', '/profile', '/analytics', '/reviews'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));
  
  if (isProtectedPath && !session?.user) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    // Auth pages
    "/login/:path*",
    "/admin-login/:path*",
    // Protected routes
    "/feedback/:path*",
    "/admin/:path*",
    "/teacher/:path*",
    "/student/:path*",
    "/profile/:path*",
    "/analytics/:path*",
    "/reviews/:path*",
  ],
};


