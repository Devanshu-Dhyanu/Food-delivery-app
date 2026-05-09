export type PortfolioRoute = '/' | '/vajra' | '/contact' | '/resume';

export type PortfolioResolvedRoute = PortfolioRoute | 'not-found';

export function parsePortfolioPath(to: string): PortfolioResolvedRoute {
  const trimmed = to.trim();
  const pathOnly = trimmed.split(/[?#]/)[0] || '/';
  const p = pathOnly.toLowerCase();
  if (p === '/' || p === '') return '/';
  if (p === '/vajra') return '/vajra';
  if (p === '/contact') return '/contact';
  if (p === '/resume') return '/resume';
  return 'not-found';
}
