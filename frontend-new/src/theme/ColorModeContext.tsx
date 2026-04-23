import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import getTheme from './theme';

type Mode = 'light' | 'dark';

type ColorModeContextValue = {
  mode: Mode;
  toggleColorMode: () => void;
  setMode: (mode: Mode) => void;
};

const ColorModeContext = createContext<ColorModeContextValue | undefined>(undefined);

export const ColorModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem('samadhaan-color-mode');
    return saved === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('samadhaan-color-mode', mode);
  }, [mode]);

  const toggleColorMode = () => {
    setMode(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => getTheme(mode), [mode]);
  const value = useMemo(() => ({ mode, toggleColorMode, setMode }), [mode]);

  return (
    <ColorModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};

export const useColorMode = () => {
  const context = useContext(ColorModeContext);
  if (!context) {
    throw new Error('useColorMode must be used within ColorModeProvider');
  }
  return context;
};
