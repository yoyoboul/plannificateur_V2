import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import '../styles/globals.css';

// Création d'un thème personnalisé
const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5', // Bleu principal
    },
    secondary: {
      main: '#4CAF50', // Vert
    },
    error: {
      main: '#F44336', // Rouge pour les statuts "À faire"
    },
    warning: {
      main: '#FF9800', // Orange pour les statuts "En cours"
    },
    info: {
      main: '#2196F3', // Bleu pour les priorités
    },
    success: {
      main: '#4CAF50', // Vert pour les statuts "Terminé"
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
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
    }
  },
  components: {
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
  },
});

function MyApp({ Component, pageProps }) {
  // État pour vérifier si l'app est prête côté client
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    // Affichage pendant l'hydratation côté client
    return null;
  }

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="fr">
        <CssBaseline />
        <Component {...pageProps} />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default MyApp; 