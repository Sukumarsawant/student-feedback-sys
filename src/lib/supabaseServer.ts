import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieStore = Awaited<ReturnType<typeof cookies>>;
type CookieOptions = Parameters<CookieStore['set']>[2];

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !anon) {
    throw new Error("Supabase environment variables are not set");
  }

  return { url, anon };
}

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();
  const { url, anon } = getSupabaseEnv();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set() {
        // Server Components can't mutate cookies; Supabase SSR will skip
      },
      remove() {
        // Server Components can't mutate cookies; Supabase SSR will skip
      },
    },
  });
}

export async function createSupabaseRouteHandlerClient() {
  const cookieStore = await cookies();
  const { url, anon } = getSupabaseEnv();

  return createServerClient(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions = {}) {
        cookieStore.set(name, value, options);
      },
      remove(name: string, options: CookieOptions = {}) {
        cookieStore.delete({ name, ...options });
      },
    },
  });
}


