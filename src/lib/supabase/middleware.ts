import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/env";
import { accountBlockReason, type AccountBlock } from "@/lib/accountStatus";

export async function updateSession(
  request: NextRequest,
  opts?: { requireActive?: boolean }
) {
  const supabaseResponse = NextResponse.next({
    request,
  });

  const { url, anonKey } = getSupabaseEnv();

  const supabase = createServerClient(
    url,
    anonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Refresh session if it exists.
  // This will also set the session cookie on the response.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Supabase Auth knows nothing about `users.is_active` / `approval_status`, so
  // a deactivated or not-yet-approved account keeps a perfectly valid session.
  // Checked only on protected routes (`requireActive`) — public pages must not
  // pay for an extra query per visit.
  let blocked: AccountBlock | null = null;
  if (user && opts?.requireActive) {
    const { data: profile } = await supabase
      .from("users")
      .select("is_active, approval_status")
      .eq("id", user.id)
      .single();

    blocked = accountBlockReason(profile);
    if (blocked) {
      // Best effort: revoke the refresh token too, not just drop the cookie.
      await supabase.auth.signOut().catch(() => undefined);
    }
  }

  return { response: supabaseResponse, user: blocked ? null : user, blocked };
}
