import { createTheme } from '@mui/material/styles';

const getTheme = (mode: 'light' | 'dark') => createTheme({
  palette: {
    mode,
    primary: {
      main: '#0ea5e9',
      light: '#7dd3fc',
      dark: '#075985',
    },
    secondary: {
      main: '#22c55e',
      light: '#86efac',
      dark: '#15803d',
    },
    background: mode === 'dark'
      ? { default: '#0b1120', paper: '#111827' }
      : { default: '#cfd3d9', paper: '#f4f6f9' },
    success: {
      main: '#22c55e',
    },
    warning: {
      main: '#f59e0b',
    },
    error: {
      main: '#ef4444',
    },
    info: {
      main: '#38bdf8',
    },
    text: mode === 'dark'
      ? { primary: '#e2e8f0', secondary: '#94a3b8' }
      : { primary: '#0f172a', secondary: '#334155' },
  },
  typography: {
    fontFamily: '"Space Grotesk", "Manrope", sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.02em' },
    h2: { fontWeight: 700, letterSpacing: '-0.02em' },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
  },
  shape: {
    borderRadius: 14,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: mode === 'dark' ? '#0b1120' : '#cfd3d9',
          color: mode === 'dark' ? '#e2e8f0' : '#0f172a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 22px',
          borderRadius: 999,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark'
            ? '0 12px 30px rgba(0, 0, 0, 0.45)'
            : '0 10px 30px rgba(15, 23, 42, 0.08)',
        },
      },
    },
  },
});

export default getTheme;
