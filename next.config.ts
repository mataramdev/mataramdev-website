import type { NextConfig } from "next";

/**
 * Uploaded media lives in Supabase Storage, whose public URLs look like
 * https://<project-ref>.supabase.co/storage/v1/object/public/<bucket>/<file>.
 * next/image refuses every host that is not listed here, so this has to match
 * the project's own domain — the wildcard only covers builds where the env var
 * is not present yet (e.g. `next build` on a machine that relies on the
 * hosting dashboard's variables).
 */
function supabaseImageHostname(): string {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").hostname;
  } catch {
    return "**.supabase.co";
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseImageHostname(),
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  experimental: {
    serverActions: {
      // Server Action bodies are capped at 1MB by default, which silently
      // rejects any upload larger than that (resource files are routinely
      // several MB). Keep this above RESOURCE_MAX_FILE_MB in src/lib/storage.ts
      // — the extra MB covers multipart boundary/header overhead.
      bodySizeLimit: "12mb",
    },
  },
};

export default nextConfig;
