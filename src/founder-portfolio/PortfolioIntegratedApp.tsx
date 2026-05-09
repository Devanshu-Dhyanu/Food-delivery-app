import { useCallback, useMemo, useState } from 'react';
import { BackToVajraCognixiaButton } from './BackToVajraCognixiaButton';
import { MinimalThemeProvider } from './MinimalThemeProvider';
import { PortfolioNavProvider } from './PortfolioNavigationContext';
import { PageNotFound } from './pages/PageNotFound';
import { ResumePage } from './pages/ResumePage';
import { ContactPage } from './pages/ContactPage';
import { Home } from './pages/Home';
import { Vajra } from './pages/Vajra';
import { parsePortfolioPath, type PortfolioResolvedRoute } from './portfolioRoutes';

type PortfolioIntegratedAppProps = {
  /** Return to main app hub (SPA); provided by FounderPage wrapper */
  onBackToMainSite: () => void;
};

/** Portfolio shell matching `portfolio-temp/src/app/App.tsx` routes, without react-router-dom */
export default function PortfolioIntegratedApp({ onBackToMainSite }: PortfolioIntegratedAppProps) {
  const [pathname, setPathname] = useState<PortfolioResolvedRoute>('/');

  const navigateTo = useCallback((to: string) => {
    setPathname(parsePortfolioPath(to));
  }, []);

  const value = useMemo(() => ({ pathname, navigateTo }), [pathname, navigateTo]);

  let body;

  switch (pathname) {
    case '/':
      body = <Home />;
      break;
    case '/vajra':
      body = <Vajra />;
      break;
    case '/contact':
      body = <ContactPage />;
      break;
    case '/resume':
      body = <ResumePage />;
      break;
    case 'not-found':
      body = <PageNotFound />;
      break;
  }

  return (
    <MinimalThemeProvider>
      <PortfolioNavProvider value={value}>
        <BackToVajraCognixiaButton onClick={onBackToMainSite} />
        {body}
      </PortfolioNavProvider>
    </MinimalThemeProvider>
  );
}
