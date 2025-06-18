import { createTheme } from '@mui/material/styles';

const palette = {
  primary: {
    main: '#1E88E5',
  },
  secondary: {
    main: '#4CAF50',
  },
  error: {
    main: '#F44336',
  },
  warning: {
    main: '#FF9800',
  },
  info: {
    main: '#2196F3',
  },
  success: {
    main: '#4CAF50',
  },
  background: {
    default: '#f5f5f5',
  },
};

const typography = {
  fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  h1: {
    fontSize: '2.2rem',
    fontWeight: 500,
  },
  h2: {
    fontSize: '1.8rem',
    fontWeight: 500,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 500,
  },
};

const components = {
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
      },
    },
  },
};

const theme = createTheme({ palette, typography, components });

export default theme;
