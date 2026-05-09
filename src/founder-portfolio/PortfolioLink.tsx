import type { AnchorHTMLAttributes, ReactNode } from 'react';
import { usePortfolioNav } from './PortfolioNavigationContext';
import { parsePortfolioPath } from './portfolioRoutes';

type PortfolioLinkProps = {
  to: string;
  className?: string;
  children?: ReactNode;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>;

/** In-app navigation for embedded portfolio routes; leaves http(s), mailto, tel, and hash targets alone */
export function PortfolioLink({ to, className, children, onClick, ...rest }: PortfolioLinkProps) {
  const { navigateTo } = usePortfolioNav();

  const skipSpa =
    to.startsWith('#') || to.startsWith('mailto:') || to.startsWith('tel:') || to.startsWith('http');

  const handleClick: AnchorHTMLAttributes<HTMLAnchorElement>['onClick'] = (e) => {
    onClick?.(e);
    if (e.defaultPrevented) return;
    if (skipSpa) return;

    const resolved = parsePortfolioPath(to);
    if (resolved === 'not-found') return;

    e.preventDefault();
    navigateTo(resolved);
  };

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
