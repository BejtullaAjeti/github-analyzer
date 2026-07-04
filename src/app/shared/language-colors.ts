export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Java: '#b07219',
  'C++': '#f34b7d',
  Rust: '#dea584',
  CSS: '#563d7c',
  HTML: '#e34c26',
  Shell: '#89e051',
  Dart: '#00B4AB',
  Kotlin: '#A97BFF',
  Swift: '#F05138',
  Makefile: '#427819',
  C: '#555555',
  Ruby: '#701516'
};

export const LANGUAGE_COLOR_FALLBACK = '#8b949e';

export function languageColor(language: string): string {
  return LANGUAGE_COLORS[language] ?? LANGUAGE_COLOR_FALLBACK;
}
