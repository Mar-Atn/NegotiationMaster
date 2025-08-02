import { createTheme } from '@mui/material/styles'

// Ubuntu-inspired color palette
const ubuntuColors = {
  primary: {
    main: '#E95420', // Ubuntu Orange
    light: '#FF6633',
    dark: '#C7451C',
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: '#AEA79F', // Ubuntu Warm Grey
    light: '#D4CFC7',
    dark: '#77706B',
    contrastText: '#333333',
  },
  grey: {
    50: '#F7F7F7',
    100: '#F0F0F0',
    200: '#E0E0E0',
    300: '#CCCCCC',
    400: '#999999',
    500: '#666666',
    600: '#4D4D4D',
    700: '#333333',
    800: '#1A1A1A',
    900: '#0F0F0F',
  },
  background: {
    default: '#FFFFFF',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#333333',
    secondary: '#666666',
  },
  success: {
    main: '#0E8420',
    light: '#38B849',
    dark: '#0A5D17',
  },
  warning: {
    main: '#F99500',
    light: '#FFAB33',
    dark: '#CC7A00',
  },
  error: {
    main: '#C7162B',
    light: '#E94555',
    dark: '#A01122',
  },
  info: {
    main: '#007AA6',
    light: '#3399CC',
    dark: '#005577',
  },
}

// Ubuntu-style typography
const ubuntuTypography = {
  fontFamily: [
    'Ubuntu',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h1: {
    fontWeight: 300,
    fontSize: '2.5rem',
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontWeight: 300,
    fontSize: '2rem',
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontWeight: 400,
    fontSize: '1.75rem',
    lineHeight: 1.3,
  },
  h4: {
    fontWeight: 300,
    fontSize: '1.5rem',
    lineHeight: 1.4,
  },
  h5: {
    fontWeight: 400,
    fontSize: '1.25rem',
    lineHeight: 1.4,
  },
  h6: {
    fontWeight: 500,
    fontSize: '1.125rem',
    lineHeight: 1.4,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
    fontWeight: 400,
  },
  subtitle1: {
    fontSize: '1rem',
    lineHeight: 1.5,
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.875rem',
    lineHeight: 1.5,
    fontWeight: 500,
    letterSpacing: '0.00714em',
    textTransform: 'uppercase',
  },
  button: {
    fontWeight: 500,
    fontSize: '0.875rem',
    textTransform: 'none',
    letterSpacing: '0.02857em',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
    fontWeight: 400,
    letterSpacing: '0.03333em',
  },
}

// Ubuntu-style component overrides
const ubuntuComponents = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        padding: '8px 24px',
        fontWeight: 500,
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        },
      },
      outlined: {
        borderWidth: '1px',
        '&:hover': {
          borderWidth: '1px',
          backgroundColor: 'rgba(233, 84, 32, 0.04)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.06)',
        '&:hover': {
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 8,
      },
      outlined: {
        border: '1px solid rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontWeight: 500,
        height: 28,
      },
      filled: {
        '&.MuiChip-colorDefault': {
          backgroundColor: '#F7F7F7',
          color: '#333333',
        },
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: 10,
        '&:hover': {
          backgroundColor: 'rgba(0, 0, 0, 0.04)',
        },
      },
    },
  },
  MuiAvatar: {
    styleOverrides: {
      root: {
        backgroundColor: ubuntuColors.primary.main,
        color: ubuntuColors.primary.contrastText,
        fontWeight: 500,
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 4,
        height: 6,
        backgroundColor: 'rgba(0, 0, 0, 0.06)',
      },
      bar: {
        borderRadius: 4,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        backgroundColor: 'rgba(0, 0, 0, 0.08)',
      },
    },
  },
  MuiContainer: {
    styleOverrides: {
      root: {
        paddingLeft: 24,
        paddingRight: 24,
      },
    },
  },
}

// Create the Ubuntu theme
const ubuntuTheme = createTheme({
  palette: ubuntuColors,
  typography: ubuntuTypography,
  components: ubuntuComponents,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
})

export default ubuntuTheme