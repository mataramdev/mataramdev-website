// ====== main.js ======
// Entry point for index.html.
// Imports and initialises every feature module in order.
// ======================================================

import { init_theme }                from './theme.js';
import { init_nav }                  from './nav.js';
import { init_slider }               from './slider.js';
import { init_lang }                 from './lang.js';
import { init_back_to_top }          from './back_to_top.js';
import { update_event_status_labels } from './events.js';
import { bind_event_buttons }        from './modal.js';
import { init_join_form }            from './join.js';
import { init_db, fetch_live_activities, fetch_live_events } from './db.js';

// Run everything once the DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  // UI / cosmetic — order-independent
  init_theme();
  init_nav();
  init_back_to_top();
  init_slider();
  init_lang();
  init_join_form();

  // Static event labels (works without DB)
  update_event_status_labels();

  // Bind modal & RSVP buttons (static HTML)
  bind_event_buttons();

  // Connect to Supabase (non-blocking; falls back gracefully)
  await init_db();

  // Fetch live data — after DB ready, re-run dependents
  await fetch_live_activities();
  await fetch_live_events(async () => {
    update_event_status_labels();
    bind_event_buttons();
    // Translate dynamically loaded elements
    const { get_lang, apply_language } = await import('./lang.js');
    apply_language(get_lang());
  });
});
