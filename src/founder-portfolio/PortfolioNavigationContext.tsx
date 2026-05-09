import { createContext, useContext, type ReactNode } from 'react';
import type { PortfolioResolvedRoute } from './portfolioRoutes';

export type PortfolioInternalPath = PortfolioResolvedRoute;

type PortfolioNavValue = {
  pathname: PortfolioResolvedRoute;
  navigateTo: (to: string) => void;
};

const defaultValue: PortfolioNavValue = {
  pathname: '/',
  navigateTo: () => {},
};

const PortfolioNavContext = createContext<PortfolioNavValue>(defaultValue);

export function usePortfolioNav(): PortfolioNavValue {
  return useContext(PortfolioNavContext);
}

export function PortfolioNavProvider({
  value,
  children,
}: {
  value: PortfolioNavValue;
  children: ReactNode;
}) {
  return <PortfolioNavContext.Provider value={value}>{children}</PortfolioNavContext.Provider>;
}
