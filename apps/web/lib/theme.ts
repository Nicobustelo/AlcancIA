export const THEME_STORAGE_KEY = 'beexo-theme';

export type Theme = 'light' | 'dark';

export function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark';
}

export function getThemeScript() {
  return `(() => {
  try {
    const storageKey = '${THEME_STORAGE_KEY}';
    const storedTheme = window.localStorage.getItem(storageKey);
    const theme =
      storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : 'dark';

    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.style.colorScheme = theme;
  } catch {}
})();`;
}
