import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";
import { isEnvError, type EnvError } from "@/lib/env";

/**
 * Guard route dashboard/admin — konvensi file Next 16.
 *
 * Dua hal membuat file ini sebelumnya tidak pernah dieksekusi, dan keduanya
 * harus benar bersamaan (dibuktikan dengan menempelkan log sementara di sini:
 * dengan bentuk lama, log-nya tidak pernah muncul):
 *
 * 1. Nama file + nama fungsi. Konvensi `middleware.ts` sudah **deprecated** di
 *    Next 16 dan diganti `proxy.ts` + fungsi `proxy()`
 *    (node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/
 *    proxy.md).
 * 2. Lokasi. File konvensi harus sejajar dengan folder `app`; project ini
 *    menaruh `app` di dalam `src/`, jadi file ini harus di `src/proxy.ts`.
 *    Versi `proxy.ts` di root tetap diabaikan.
 *
 * Selama keduanya salah, guard di sini (termasuk refresh cookie sesi Supabase)
 * tidak berjalan dan yang tersisa hanya pengalihan di layout.
 *
 * Catatan dari dokumentasinya: Server Action dikirim sebagai POST ke route
 * tempat ia dipakai, jadi matcher yang mengecualikan sebuah path juga melewati
 * Server Action di path itu. Otorisasi tetap diperiksa lagi di server action /
 * layout, bukan hanya di sini.
 */
export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Protected routes: (dashboard) and (admin)
  const isProtectedRoute =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profil") ||
    pathname.startsWith("/proyek-saya") ||
    pathname.startsWith("/artikel-saya") ||
    pathname.startsWith("/admin");

  let session: Awaited<ReturnType<typeof updateSession>>;

  try {
    // `requireActive` hanya untuk route terproteksi: sesi Supabase yang sah
    // tetap dimiliki akun yang belum disetujui / sudah dinonaktifkan, jadi
    // status akunnya diperiksa di sini (satu query tambahan). Halaman publik
    // melewatinya supaya tidak membayar query itu di setiap kunjungan.
    session = await updateSession(request, { requireActive: isProtectedRoute });
  } catch (error) {
    // Without Supabase credentials there is no session to check, so every
    // route would fail. Show the reason instead of an opaque 500.
    if (isEnvError(error)) return envErrorResponse(error);
    throw error;
  }

  const { response, user, blocked } = session;

  if (blocked) {
    // Session already revoked (signOut inside updateSession); carry its
    // cleared cookies onto the redirect so the browser drops them too.
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = new URLSearchParams({ blocked }).toString();
    const redirectResponse = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirectedFrom", pathname);
    return Response.redirect(url);
  }

  return response;
}

function envErrorResponse(error: EnvError) {
  return new NextResponse(
    `Konfigurasi server belum lengkap.\n\n${error.message}\n`,
    {
      status: 503,
      headers: { "content-type": "text/plain; charset=utf-8" },
    },
  );
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (browser favicon)
     * - / (root page)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
