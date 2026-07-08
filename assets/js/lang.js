// ====== lang.js ======
// Multi-language (i18n) system.
// Supported: 'en' (English) and 'id' (Indonesian).
// Translations loaded from: assets/lang/{en|id}.json
// ======================================================

let translations = {};

// Input placeholder strings (not in JSON because they're on attributes)
const PLACEHOLDERS = {
  en: {
    joinName:    'Full Name',
    joinEmail:   'Email',
    joinInterest:'Interest Area (e.g. Web, Mobile, AI)',
    joinLevel:   'Level (Beginner / Intermediate / Advanced)',
    joinMessage: 'Message or expectations for the community (optional)'
  },
  id: {
    joinName:    'Nama Lengkap',
    joinEmail:   'Email',
    joinInterest:'Area Minat (misal: Web, Mobile, AI)',
    joinLevel:   'Tingkat (Pemula / Menengah / Lanjutan)',
    joinMessage: 'Pesan atau harapan untuk komunitas (opsional)'
  }
};

// Event metadata per locale (location/time strings)
const EVENT_META = {
  'meetup-1':          { en: '📍 APRA College, Mataram • 09:00 WITA • 3 hours',            id: '📍 APRA College, Mataram • 09:00 WITA • 3 jam'         },
  'tailwind-workshop': { en: '📍 Online • 15:00 WITA • 2 hours',                           id: '📍 Online • 15:00 WITA • 2 jam'                         },
  'opensource-night':  { en: '📍 Co-working Space, Mataram • 18:00 WITA',                  id: '📍 Co-working Space, Mataram • 18:00 WITA'              },
  'hackathon':         { en: '📍 TBD • 09:00 — 17:00 WITA',                               id: '📍 TBD • 09:00 — 17:00 WITA'                           }
};

/** Returns the currently active locale string ('en' | 'id'). */
export function get_lang() {
  return localStorage.getItem('mataramdev-lang') || 'en';
}

/**
 * Loads a locale JSON, applies it to all [data-i18n] elements,
 * updates placeholders and event-meta strings.
 */
export async function apply_language(lang) {
  localStorage.setItem('mataramdev-lang', lang);

  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'en' ? 'ID' : 'EN';

  try {
    const root = document.body.getAttribute('data-root-path') || './';
    const res = await fetch(`${root}assets/lang/${lang}.json`);
    if (!res.ok) throw new Error('Translation JSON failed to fetch');
    translations = await res.json();
  } catch (err) {
    console.error('Translation loading error:', err);
    return;
  }

  // Apply to marked elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    const val = translations[key];
    if (!val) return;

    if (val.includes('<') || val.includes('&')) {
      el.innerHTML = val;
    } else {
      el.textContent = val;
    }
  });

  // Apply placeholders
  const ph = PLACEHOLDERS[lang];
  if (ph) {
    Object.keys(ph).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.setAttribute('placeholder', ph[id]);
    });
  }

  // Apply event meta
  document.querySelectorAll('[data-event-meta]').forEach(el => {
    const event_id = el.getAttribute('data-event-meta');
    if (EVENT_META[event_id]?.[lang]) el.textContent = EVENT_META[event_id][lang];
  });
}

/** Bootstraps the toggle button and loads the saved locale. */
export function init_lang() {
  const btn = document.getElementById('langToggle');
  if (!btn) return;

  let current = get_lang();

  btn.addEventListener('click', () => {
    current = current === 'en' ? 'id' : 'en';
    apply_language(current);
  });

  apply_language(current);
}
