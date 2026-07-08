// ====== config.js ======
// Constants and .env file loader.
// Used by: db.js
// ======================================================

export const INTERVAL_SLIDER_MS = 4000;
export const BACK_TO_TOP_THRESHOLD = 300;

/**
 * Reads key=value pairs from the /.env file served at root.
 * Falls back to window globals if the file is unavailable.
 * @returns {Promise<{SUPABASE_URL: string, SUPABASE_ANON_KEY: string}>}
 */
export async function load_env() {
  try {
    const root = document.body.getAttribute('data-root-path') || './';
    const response = await fetch(`${root}.env`);
    if (!response.ok) throw new Error('Failed to load .env');

    const text = await response.text();
    const env  = {};

    text.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const parts = trimmed.split('=');
      if (parts.length < 2) return;

      const key   = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
      env[key] = value;
    });

    return env;
  } catch (e) {
    console.warn('Could not read .env, using environment defaults:', e.message);
    return {
      SUPABASE_URL:      window.SUPABASE_URL      || 'https://your-project-id.supabase.co',
      SUPABASE_ANON_KEY: window.SUPABASE_ANON_KEY || 'your-anon-public-key'
    };
  }
}
