"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabaseClient";
import { usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { Home, FileText, Users, Star } from "lucide-react";

type Profile = {
  role: string;
  full_name?: string;
  avatar_url?: string | null;
} | null;

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
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showLoginDropdown, setShowLoginDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect for navbar compression
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 50;
      setIsScrolled(scrolled);
      // Close login dropdown when scrolling
      if (scrolled && showLoginDropdown) {
        setShowLoginDropdown(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showLoginDropdown]);

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

      // Call server logout route to clear cookies
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const body = await response.text();
        throw new Error(body || 'Failed to sign out');
      }

      // Clear local state
      setUser(null);
      setProfile(null);
      
      // Use hard navigation to clear all client-side cache
      window.location.href = '/login?role=student';
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to sign out';
      console.error("Failed to sign out:", message);
      alert(`Logout failed: ${message}`);
      setLoggingOut(false);
    }
  };

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 w-full px-4 transition-all duration-500 ease-out animate-slide-down ${
      isScrolled ? 'top-2 max-w-2xl' : 'top-6 max-w-6xl'
    }`}>
      <div className={`glass-navbar-enhanced flex items-center rounded-full transition-all duration-500 ease-out ${
        isScrolled ? 'px-5 py-2.5 justify-between' : 'px-8 py-4 justify-between'
      }`}>
        
        {/* Left Navigation Icons */}
        <div className={`flex items-center transition-all duration-500 ease-out ${
          isScrolled ? 'gap-1' : 'gap-2.5'
        }`}>
          {/* Home Icon */}
          <Link 
            href="/" 
            className={`group relative rounded-xl transition-all duration-500 ease-out ${
              pathname === "/" 
                ? "bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/25" 
                : "hover:bg-gray-100"
            } ${isScrolled ? 'p-2' : 'p-3'}`}
            title="Home"
          >
            <Home 
              size={isScrolled ? 17 : 19} 
              strokeWidth={2.5} 
              className={`nav-icon ${pathname === "/" ? "text-white nav-icon-active" : "text-gray-700 group-hover:text-[var(--brand-primary)]"}`}
            />
          </Link>
          
          {/* Team Icon */}
          <Link 
            href="/team" 
            className={`group relative rounded-xl transition-all duration-500 ease-out ${
              pathname === "/team" 
                ? "bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/25" 
                : "hover:bg-gray-100"
            } ${isScrolled ? 'p-2' : 'p-3'}`}
            title="Team"
          >
            <Users 
              size={isScrolled ? 17 : 19} 
              strokeWidth={2.5} 
              className={`nav-icon ${pathname === "/team" ? "text-white nav-icon-active" : "text-gray-700 group-hover:text-[var(--brand-primary)]"}`}
            />
          </Link>
          
          {/* Reviews Icon */}
          <Link 
            href="/reviews" 
            className={`group relative rounded-xl transition-all duration-500 ease-out ${
              pathname === "/reviews" 
                ? "bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/25" 
                : "hover:bg-gray-100"
            } ${isScrolled ? 'p-2' : 'p-3'}`}
            title="Reviews"
          >
            <Star 
              size={isScrolled ? 17 : 19} 
              strokeWidth={2.5} 
              className={`nav-icon ${pathname === "/reviews" ? "text-white nav-icon-active" : "text-gray-700 group-hover:text-[var(--brand-primary)]"}`}
            />
          </Link>
        </div>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center transition-all duration-500 ease-out">
          <Link href="/" className="transition-transform duration-300 hover:scale-105">
            <Image
              src="/images/logo/Gemini_Generated_Image_hm72xfhm72xfhm72-removebg-preview.png"
              alt="Logo"
              width={isScrolled ? 80 : 120}
              height={isScrolled ? 27 : 40}
              className={`h-auto object-contain transition-all duration-500 ease-out ${
                isScrolled ? 'w-[80px]' : 'w-[120px]'
              }`}
              priority
            />
          </Link>
        </div>

        {/* Right Navigation */}
        <div className={`flex items-center transition-all duration-500 ease-out ${
          isScrolled ? 'gap-1 ml-auto' : 'gap-2.5 ml-auto'
        }`}>
          {/* Dashboard/Forms Icon */}
          <Link
            href={user ? (profile?.role === "student" ? "/feedback" : "/analytics") : "/login"}
            className={`group relative rounded-xl transition-all duration-500 ease-out ${
              pathname === "/feedback" || pathname === "/analytics" 
                ? "bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/25" 
                : "hover:bg-gray-100"
            } ${isScrolled ? 'p-2' : 'p-3'}`}
            title="Dashboard"
          >
            <FileText 
              size={isScrolled ? 17 : 19} 
              strokeWidth={2.5} 
              className={`nav-icon ${pathname === "/feedback" || pathname === "/analytics" ? "text-white nav-icon-active" : "text-gray-700 group-hover:text-[var(--brand-primary)]"}`}
            />
          </Link>
        </div>

        {/* Profile or Login Section */}
        <div className={`flex items-center transition-all duration-500 ease-out ${
          isScrolled ? 'ml-3' : 'ml-6'
        }`}>
          {loading ? (
            <div className={`flex items-center gap-2.5 rounded-full bg-gray-100/80 transition-all duration-500 ease-out ${
              isScrolled ? 'px-3 py-2' : 'px-4 py-2.5'
            }`}>
              <div className="h-2 w-2 rounded-full bg-gray-500 animate-pulse"></div>
              {!isScrolled && <span className="text-xs font-semibold text-gray-600">Loading</span>}
            </div>
          ) : user ? (
            <div className={`flex items-center transition-all duration-500 ease-out ${
              isScrolled ? 'gap-1.5' : 'gap-2'
            }`}>
              <Link
                href="/profile"
                className={`group flex items-center gap-2.5 rounded-full transition-all duration-500 ease-out ${
                  pathname === "/profile"
                    ? "bg-[var(--brand-primary)] shadow-lg shadow-[var(--brand-primary)]/25"
                    : "hover:bg-gray-100"
                } ${isScrolled ? 'pl-1 pr-2 py-1' : 'pl-1.5 pr-4 py-1.5'}`}
                title="Profile"
              >
                {profile?.avatar_url ? (
                  <span className={`inline-flex overflow-hidden rounded-full border-2 border-white shadow-sm transition-all duration-500 ease-out ${
                    isScrolled ? 'h-7 w-7' : 'h-8 w-8'
                  }`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={profile.avatar_url}
                      alt={profile.full_name ?? "Profile"}
                      className="h-full w-full object-cover"
                    />
                  </span>
                ) : (
                  <span className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-[var(--brand-primary)] to-purple-600 font-bold text-white shadow-sm border-2 border-white transition-all duration-500 ease-out ${
                    isScrolled ? 'h-7 w-7 text-[10px]' : 'h-8 w-8 text-xs'
                  }`}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? "U"}
                  </span>
                )}
                {!isScrolled && (
                  <span className={`hidden sm:inline text-sm font-semibold transition-colors ${
                    pathname === "/profile" ? "text-white" : "text-gray-800 group-hover:text-[var(--brand-primary)]"
                  }`}>
                    {profile?.full_name?.split(' ')[0] || "Profile"}
                  </span>
                )}
              </Link>
              
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-500 ease-out disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                  isScrolled ? 'px-3 py-1.5 text-xs' : 'px-5 py-2.5 text-sm'
                }`}
              >
                {loggingOut ? (
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                  </span>
                ) : (
                  "Logout"
                )}
              </button>
            </div>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowLoginDropdown(!showLoginDropdown)}
                className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-full font-semibold hover:from-gray-800 hover:to-gray-700 transition-all duration-500 ease-out shadow-md hover:shadow-lg hover:-translate-y-0.5 ${
                  isScrolled ? 'px-4 py-1.5 text-xs' : 'px-6 py-2.5 text-sm'
                }`}
              >
                Login
              </button>
              {showLoginDropdown && (
                <div className="absolute right-0 mt-3 w-44 bg-white backdrop-blur-xl rounded-xl shadow-[0_12px_40px_rgb(0,0,0,0.15)] py-2 animate-scale-in border border-gray-200 overflow-hidden">
                  <Link
                    href="/login?role=student"
                    className="block px-5 py-3 text-sm font-medium !text-black hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Student
                  </Link>
                  <Link
                    href="/login?role=teacher"
                    className="block px-5 py-3 text-sm font-medium !text-black hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Teacher
                  </Link>
                  <Link
                    href="/admin-login"
                    className="block px-5 py-3 text-sm font-medium !text-black hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => setShowLoginDropdown(false)}
                  >
                    Admin
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}