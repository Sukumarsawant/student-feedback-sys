"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

type Profile = {
  role: string;
  full_name?: string;
  avatar_url?: string | null;
} | null;

const roleNavItems: Record<string, { href: string; label: string }> = {
  student: { href: "/student", label: "Dashboard" },
  teacher: { href: "/teacher", label: "Dashboard" },
  admin: { href: "/admin", label: "Dashboard" }
};

type NavLink = {
  href: string;
  label: string;
  variant?: "link" | "primary" | "outline";
};

type SupabaseProfileRow = {
  role: string | null;
  full_name?: string | null;
  fullName?: string | null;
  avatar_url?: string | null;
};

function resolveProfileRecord(profile: SupabaseProfileRow | null, user: User | null): Profile {
  if (profile && typeof profile.role === "string") {
    const profileFullName =
      (typeof profile.full_name === "string" && profile.full_name) ||
      (typeof profile.fullName === "string" && profile.fullName) ||
      undefined;

    return {
      role: profile.role.toLowerCase(),
      full_name: profileFullName,
      avatar_url: profile.avatar_url ?? null,
    };
  }

  if (!user) {
    return null;
  }

  const metadata = (user.user_metadata ?? {}) as Record<string, unknown>;
  const role = typeof metadata.role === "string" ? metadata.role : undefined;
  const fullNameMeta =
    (typeof metadata.full_name === "string" && metadata.full_name) ||
    (typeof metadata.fullName === "string" && metadata.fullName) ||
    undefined;
  const avatarMeta = typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined;

  if (!role) {
    return null;
  }

  return {
    role: role.toLowerCase(),
    full_name: fullNameMeta,
    avatar_url: avatarMeta ?? null,
  };
}

export default function Navbar() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  const navLinks = useMemo<NavLink[]>(() => {
    const links: NavLink[] = [
      { href: "/", label: "Home" },
      { href: "/#team", label: "Team" },
    ];

    const role = profile?.role;

    if (!role) {
      links.push(
        { href: "/login?role=student", label: "Student Login", variant: "primary" },
        { href: "/login?role=teacher", label: "Teacher Login", variant: "outline" },
        { href: "/admin-login", label: "Admin Login", variant: "outline" }
      );
      return links;
    }

    if (roleNavItems[role]) {
      links.push(roleNavItems[role]);
    }

    if (role !== "student") {
      links.push({ href: "/analytics", label: "Analytics" });
    }

    return links;
  }, [profile?.role]);

  useEffect(() => {
    // Get initial user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        setProfile(resolveProfileRecord(profile as SupabaseProfileRow | null, user));
      } else {
        setProfile(null);
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user || null);
        
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          setProfile(resolveProfileRecord(profile as SupabaseProfileRow | null, session.user));
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);

      const [clientResult, serverResult] = await Promise.allSettled([
        supabase.auth.signOut(),
        fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      ]);

      if (clientResult.status === 'rejected') {
        throw clientResult.reason;
      }

      if (serverResult.status === 'rejected') {
        throw serverResult.reason;
      }

      if (!serverResult.value.ok) {
        const body = await serverResult.value.text();
        throw new Error(body || 'Failed to complete sign out');
      }

      setUser(null);
      setProfile(null);
      router.push('/login');
      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      console.error("Failed to sign out:", message);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-[var(--brand-secondary)]/50 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
  <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4 sm:px-8">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/" className="flex items-center gap-3">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-secondary)] text-lg font-bold uppercase text-[var(--brand-dark)] shadow-sm">
              SF
            </span>
            <div className="flex flex-col leading-tight">
              <span className="text-base font-semibold uppercase tracking-[0.3em] text-[var(--brand-dark)]/80">
                Student Feedback
              </span>
              <span className="text-xs font-medium text-slate-500">DBMS Project</span>
            </div>
          </Link>

          <div className="hidden items-center gap-3 text-sm font-semibold uppercase tracking-[0.25em] text-slate-600 lg:flex">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              if (item.variant === "primary") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center rounded-full bg-[var(--brand-primary)] px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:bg-[var(--brand-primary-dark)]"
                  >
                    {item.label}
                  </Link>
                );
              }

              if (item.variant === "outline") {
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center rounded-full border border-[var(--brand-primary)]/40 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--brand-primary)] transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)]"
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                    className={`rounded-full px-4 py-2 text-slate-700 transition ${
                    isActive
                      ? "bg-[var(--brand-primary)]/15 text-[var(--brand-primary)] shadow-sm"
                        : "link-hover hover:bg-[var(--brand-secondary)]/45 hover:text-[var(--brand-primary)]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

  <div className="flex items-center gap-3 text-sm whitespace-nowrap">
          {loading ? (
            <div className="rounded-full bg-[var(--brand-muted)] px-3 py-1 text-slate-500">
              Loading…
            </div>
          ) : user ? (
            <>
              <Link
                href="/profile"
                className="inline-flex h-11 items-center gap-3 rounded-full border border-[var(--brand-primary)]/40 bg-white px-4 text-sm font-semibold text-[var(--brand-primary)] shadow-sm transition hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary-dark)]"
              >
                {profile?.avatar_url ? (
                  <span className="inline-flex h-9 w-9 overflow-hidden rounded-full border border-[var(--brand-primary)]/40 bg-white/60">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name ?? user.email ?? "Profile avatar"}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : (
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand-primary)]/15 text-sm font-semibold text-[var(--brand-primary)]">
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? user.email?.charAt(0)?.toUpperCase() ?? "U"}
                  </span>
                )}
                <span className="hidden sm:inline">
                  {profile?.full_name || user.email}
                </span>
                {profile?.role && (
                  <span className="badge bg-[var(--brand-secondary)] text-[var(--brand-dark)]">
                    {profile.role}
                  </span>
                )}
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="btn btn-primary h-11 whitespace-nowrap px-6 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loggingOut ? 'Signing out…' : 'Logout'}
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.25em] text-slate-600 lg:hidden">
              <Link
                href="/login?role=student"
                className="inline-flex items-center rounded-full bg-[var(--brand-primary)] px-4 py-2 text-white"
              >
                Student Login
              </Link>
              <Link
                href="/login?role=teacher"
                className="inline-flex items-center rounded-full border border-[var(--brand-primary)]/40 px-4 py-2 text-[var(--brand-primary)]"
              >
                Teacher Login
              </Link>
              <Link
                href="/admin-login"
                className="inline-flex items-center rounded-full border border-[var(--brand-primary)]/40 px-4 py-2 text-[var(--brand-primary)]"
              >
                Admin Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}