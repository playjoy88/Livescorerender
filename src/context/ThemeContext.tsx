import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  // Initialize with a default theme
  const [theme, setTheme] = useState<Theme>('light');
  
  // Initialize theme from localStorage or system preference when on client
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme as Theme);
      return;
    }
    
    // Otherwise use system preference
    if (window.matchMedia) {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setTheme(isDark ? 'dark' : 'light');
    }
  }, []);
  
  // Apply theme class to document body when theme changes
  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') return;
    
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark-theme');
      root.classList.remove('light-theme');
    } else {
      root.classList.add('light-theme');
      root.classList.remove('dark-theme');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Toggle between light and dark theme
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
