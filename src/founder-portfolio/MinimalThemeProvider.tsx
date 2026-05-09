import { createContext, useEffect, useState, type ReactNode } from 'react';

/** Dark/light toggle context from the original portfolio without Material-UI */
type ThemeContextValue = {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
};

export const ThemeContext = createContext<ThemeContextValue>({
  theme: 'dark',
  toggleTheme: () => {},
});

export function MinimalThemeProvider({ children }: { children: ReactNode }) {
  const getInitialMode = () => {
    if (typeof localStorage === 'undefined') return true;
    const isReturningUser = 'dark' in localStorage;
    const savedMode = JSON.parse(localStorage.getItem('dark') || 'null');
    const userPrefersDark =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    if (isReturningUser && savedMode !== null) {
      return savedMode;
    }
    return !!userPrefersDark;
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialMode() ? 'dark' : 'light');

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dark', JSON.stringify(theme === 'dark'));
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>
  );
}
