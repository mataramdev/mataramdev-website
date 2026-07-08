// ====== db.js ======
// Supabase client initialisation + live data fetchers.
// Exports a `get_client()` accessor used by join.js, events.js, modal.js.
// ======================================================

import { load_env } from './config.js';

let _client = null;

/**
 * Initialise Supabase once. Safe to call multiple times.
 * @returns {Promise<object|null>}
 */
export async function init_db() {
  const env = await load_env();

  if (typeof window.supabase !== 'undefined' && window.supabase.createClient) {
    _client = window.supabase.createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY);
    console.log('Supabase client successfully initialised!');
  } else {
    console.warn('Supabase SDK not loaded. Running in local fallback/mock mode.');
  }

  return _client;
}

/** Returns the Supabase client (or null in mock mode). */
export function get_client() {
  return _client;
}

// ── Live data fetchers ──

/**
 * Replaces the Activities section with live DB rows when available.
 */
export async function fetch_live_activities() {
  if (!_client) return;

  const { data: activities, error } = await _client
    .from('activities')
    .select('*')
    .eq('published', true)
    .order('sort_order', { ascending: true });

  if (error) {
    console.error('Failed to load live activities:', error.message);
    return;
  }

  const container = document.querySelector('#activities .cards-grid');
  if (!container || !activities.length) return;

  container.innerHTML = '';
  activities.forEach(act => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <div class="card-icon">${act.icon || '💻'}</div>
      <h3>${act.title}</h3>
      <p>${act.description}</p>
    `;
    container.appendChild(card);
  });
}

/**
 * Replaces the Events list with live DB rows when available.
 * After populating, re-runs status labels and re-binds event buttons.
 * @param {Function} on_done  Called after DOM is updated (for re-binding).
 */
export async function fetch_live_events(on_done) {
  if (!_client) return;

  const { data: events, error } = await _client
    .from('events')
    .select('*')
    .eq('published', true)
    .order('start_at', { ascending: true });

  if (error) {
    console.error('Failed to load live events:', error.message);
    return;
  }

  const list = document.querySelector('#events .event-list');
  if (!list || !events.length) return;

  list.innerHTML = '';
  events.forEach(evt => {
    const date_obj = new Date(evt.start_at);
    const day      = date_obj.getDate();
    const month    = date_obj.toLocaleString('default', { month: 'short' });
    const date_attr = date_obj.toISOString().split('T')[0];
    const time_str  = date_obj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const article = document.createElement('article');
    article.className = 'event-item';
    article.setAttribute('data-date', date_attr);
    article.innerHTML = `
      <div class="event-date">
        <span class="event-day">${day}</span>
        <span class="event-month">${month}</span>
      </div>
      <div class="event-info">
        <div class="event-info-header">
          <h3>${evt.title}</h3>
          <span class="event-label"></span>
        </div>
        <p class="event-meta" data-event-meta="${evt.id}">📍 ${evt.location} • ${time_str} WITA</p>
        <p class="event-desc">${evt.description}</p>
      </div>
      <div class="event-actions">
        <button class="btn btn-small btn-secondary event-details-btn" data-event-id="${evt.id}" data-i18n="btn-details">Details</button>
        <button class="btn btn-small btn-primary event-rsvp-btn"    data-event-id="${evt.id}" data-i18n="btn-rsvp">RSVP</button>
      </div>
    `;
    list.appendChild(article);
  });

  if (typeof on_done === 'function') on_done();
}
