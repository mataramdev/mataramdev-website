// ====== theme.js ======
// Light / dark theme toggle.
// Reads/writes 'mataramdev-theme' in localStorage.
// Swaps the toggle button icon via data-theme attribute on <html>.
// ======================================================

export function init_theme() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const icon  = btn.querySelector('img');
  const saved = localStorage.getItem('mataramdev-theme');
  const root  = document.body.getAttribute('data-root-path') || './';

  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    if (icon) icon.src = `${root}assets/images/light-mode.svg`;
  } else {
    document.documentElement.removeAttribute('data-theme');
    if (icon) icon.src = `${root}assets/images/dark-mode.svg`;
  }

  btn.addEventListener('click', () => {
    const html   = document.documentElement;
    const is_dark = html.getAttribute('data-theme') === 'dark';

    if (is_dark) {
      html.removeAttribute('data-theme');
      localStorage.setItem('mataramdev-theme', 'light');
      if (icon) icon.src = `${root}assets/images/dark-mode.svg`;
    } else {
      html.setAttribute('data-theme', 'dark');
      localStorage.setItem('mataramdev-theme', 'dark');
      if (icon) icon.src = `${root}assets/images/light-mode.svg`;
    }
  });
}
