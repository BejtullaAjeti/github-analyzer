import { signal } from '@angular/core';

/** Bumped by App.toggleTheme() so chart components know to re-read CSS vars and redraw. */
export const themeVersion = signal(0);

export function cssVar(name: string): string {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}
