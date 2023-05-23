import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#33B2C1',
    },
    secondary: {
      main: '#000000',
    },
  },
  typography: {
    fontFamily: 'Lato, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          border: '2px solid #33B2C1', // or any color you want
        },
        },
        },
        },

});

export default theme;
