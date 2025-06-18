import { useState, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../styles/theme';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/fr';
import '../styles/globals.css';


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
