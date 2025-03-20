import { createTheme } from '@mui/material/styles';

// Create theme with light and dark mode options
const createAppTheme = (mode) => createTheme({
  palette: {
    mode,
    primary: {
      main: mode === 'dark' ? '#3f51b5' : '#1976d2',
    },
    secondary: {
      main: '#f50057',
    },
    background: {
      default: mode === 'dark' ? '#121212' : '#f5f5f5',
      paper: mode === 'dark' ? '#1e1e1e' : '#ffffff',
    },
  },
  typography: {
    fontFamily: [
      'Inter',
      'Roboto',
      'Arial',
      'sans-serif'
    ].join(','),
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'dark'
            ? '0 4px 12px 0 rgba(0,0,0,0.8)'
            : '0 4px 12px 0 rgba(31,38,135,0.07)',
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          fontWeight: 500,
        }
      }
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          backgroundColor: mode === 'dark' ? '#272727' : '#f0f2f5',
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 0,
          boxShadow: mode === 'dark'
            ? '0 4px 12px 0 rgba(0,0,0,0.8)'
            : '0 4px 12px 0 rgba(31,38,135,0.07)',
        }
      }
    }
  },
  shape: {
    borderRadius: 8,
  }
});

export default createAppTheme;