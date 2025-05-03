import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#FFDE59', // Bright yellow (replacing orange)
      light: '#FFE082',
      dark: '#FFC107',
      contrastText: '#000000',
    },
    secondary: {
      main: '#2EC4B6', // Turquoise
      light: '#4DD0C5',
      dark: '#1E8A80',
      contrastText: '#000000',
    },
    background: {
      default: '#121212',
      paper: '#1E1E1E',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
    },
    error: {
      main: '#FF4B4B',
    },
    success: {
      main: '#00C853',
    },
  },
  typography: {
    fontFamily: "'Poppins', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
    },
    h5: {
      fontWeight: 500,
      fontSize: '1.25rem',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(255,222,89,0.25)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&.MuiButton-containedPrimary': {
            background: 'linear-gradient(45deg, #FFDE59 30%, #FFE082 90%)',
            color: '#000000',
          },
          '&.MuiButton-containedSecondary': {
            background: 'linear-gradient(45deg, #2EC4B6 30%, #4DD0C5 90%)',
          },
        },
        outlined: {
          borderColor: '#FFDE59',
          color: '#FFDE59',
          '&:hover': {
            borderColor: '#FFE082',
            backgroundColor: 'rgba(255, 222, 89, 0.08)',
          }
        }
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFDE59',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#FFDE59',
            }
          },
          '& .MuiFilledInput-root': {
            borderRadius: '12px 12px 0 0',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
            }
          },
          '& .MuiInputLabel-root.Mui-focused': {
            color: '#FFDE59',
          }
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          transition: 'all 0.3s ease-in-out',
          backgroundColor: '#1E1E1E',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: '#1E1E1E',
          borderColor: '#333333',
        },
      },
    },
    MuiInputAdornment: {
      styleOverrides: {
        root: {
          color: '#FFDE59'
        }
      }
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          '&.MuiDivider-withChildren': {
            '&::before, &::after': {
              borderColor: 'rgba(255, 255, 255, 0.1)',
            }
          }
        }
      }
    }
  },
});

export default theme; 