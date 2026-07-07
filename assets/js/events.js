// ====== events.js ======
// Event status badge calculations (Upcoming / Ended).
// Disables the RSVP button for past events.
// ======================================================

/**
 * Inspects each .event-item[data-date] and stamps it
 * with an 'Upcoming' or 'Ended' label.
 */
export function update_event_status_labels() {
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  document.querySelectorAll('.event-item').forEach(item => {
    const date_str = item.getAttribute('data-date');
    if (!date_str) return;

    const event_date = new Date(date_str + 'T23:59:59');
    const label      = item.querySelector('.event-label');
    if (!label) return;

    if (event_date < today) {
      label.setAttribute('data-i18n', 'event-status-ended');
      label.classList.add('ended');
      item.classList.add('ended');

      const rsvp_btn = item.querySelector('.event-rsvp-btn');
      if (rsvp_btn) {
        rsvp_btn.classList.add('disabled');
        rsvp_btn.setAttribute('disabled', 'true');
      }
    } else {
      label.setAttribute('data-i18n', 'event-status-upcoming');
      label.classList.add('upcoming');
    }
  });
}
