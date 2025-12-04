import React, { useMemo, useState } from 'react';
import './App.css';
import { ThemeProvider, createTheme, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import NavBar from './components/NavBar';
import Dashboard from './components/Dashboard';
import UploadData from './components/uploadData';
import ConversationView from './components/chatPage';
import MissedClients from './components/missedclients';
import { AppBar, Drawer, IconButton, Toolbar, useMediaQuery } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 280;

function App() {
  const theme = useMemo(
  () =>
    createTheme({
      palette: {
        mode: 'light',
        primary: { 
          main: '#0078D4',      // Big FM Blue - primary actions
          dark: '#005A9E',      // Darker blue for headers
          light: '#4A9EE0',     // Lighter blue for hover states
        },
        secondary: { 
          main: '#FFD500',      // Big FM Yellow - highlights & accents
          dark: '#E6C200',      // Darker yellow for active states
          light: '#FFE347',     // Lighter yellow for backgrounds
        },
        success: {
          main: '#10B981',      // Success states
        },
        info: {
          main: '#00B8D9',      // Info messages
        },
        warning: {
          main: '#FFA726',      // Warning indicators
        },
        error: {
          main: '#EF4444',      // Error states
        },
        background: { 
          default: '#F8FAFC',   // Soft off-white for main background
          paper: '#FFFFFF',     // Pure white for cards
          subtle: '#F1F5F9',    // Very light gray for sections
        },
        text: {
          primary: '#1E293B',   // Dark slate for primary text
          secondary: '#64748B', // Medium slate for secondary text
          disabled: '#94A3B8',  // Light slate for disabled text
        },
        divider: '#E2E8F0',     // Subtle dividers
      },
      shape: { 
        borderRadius: 12,        // Modern, friendly rounded corners
      },
      typography: {
        fontFamily: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ].join(','),
        h1: {
          fontWeight: 700,
          fontSize: '2.5rem',
          color: '#1E293B',
          letterSpacing: '-0.02em',
        },
        h2: {
          fontWeight: 700,
          fontSize: '2rem',
          color: '#1E293B',
          letterSpacing: '-0.01em',
        },
        h3: {
          fontWeight: 600,
          fontSize: '1.75rem',
          color: '#1E293B',
        },
        h4: {
          fontWeight: 600,
          fontSize: '1.5rem',
          color: '#1E293B',
        },
        h5: {
          fontWeight: 600,
          fontSize: '1.25rem',
          color: '#1E293B',
        },
        h6: { 
          fontWeight: 600,
          fontSize: '1.125rem',
          color: '#1E293B',
        },
        subtitle1: {
          fontSize: '1rem',
          fontWeight: 500,
          color: '#475569',
        },
        subtitle2: {
          fontSize: '0.875rem',
          fontWeight: 500,
          color: '#64748B',
        },
        body1: {
          fontSize: '1rem',
          color: '#334155',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          color: '#475569',
          lineHeight: 1.5,
        },
        button: {
          textTransform: 'none',
          fontWeight: 600,
          letterSpacing: '0.02em',
        },
        caption: {
          fontSize: '0.75rem',
          color: '#64748B',
        },
      },
      shadows: [
        'none',
        '0px 2px 4px rgba(0, 120, 212, 0.05)',
        '0px 4px 8px rgba(0, 120, 212, 0.08)',
        '0px 8px 16px rgba(0, 120, 212, 0.1)',
        '0px 12px 24px rgba(0, 120, 212, 0.12)',
        '0px 16px 32px rgba(0, 120, 212, 0.14)',
        '0px 20px 40px rgba(0, 120, 212, 0.16)',
        ...Array(18).fill('0px 24px 48px rgba(0, 120, 212, 0.18)'),
      ],
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              borderRadius: 10,
              padding: '10px 24px',
              fontSize: '0.9375rem',
              fontWeight: 600,
              boxShadow: 'none',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: '0px 4px 12px rgba(0, 120, 212, 0.2)',
                transform: 'translateY(-1px)',
              },
            },
            containedPrimary: {
              background: 'linear-gradient(135deg, #0078D4 0%, #005A9E 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #005A9E 0%, #004578 100%)',
              },
            },
            containedSecondary: {
              background: 'linear-gradient(135deg, #FFD500 0%, #FFC700 100%)',
              color: '#1E293B',
              '&:hover': {
                background: 'linear-gradient(135deg, #E6C200 0%, #D4B000 100%)',
              },
            },
            outlined: {
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2,
              },
            },
            text: {
              '&:hover': {
                backgroundColor: 'rgba(0, 120, 212, 0.08)',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              borderRadius: 16,
              boxShadow: '0px 4px 12px rgba(0, 120, 212, 0.08)',
              border: '1px solid #E2E8F0',
              transition: 'all 0.3s ease-in-out',
              '&:hover': {
                boxShadow: '0px 8px 24px rgba(0, 120, 212, 0.12)',
                transform: 'translateY(-2px)',
              },
            },
          },
        },
        MuiPaper: {
          styleOverrides: {
            root: {
              backgroundImage: 'none',
            },
            rounded: {
              borderRadius: 12,
            },
          },
        },
        MuiChip: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              fontWeight: 500,
            },
            filled: {
              backgroundColor: '#F1F5F9',
              color: '#475569',
            },
          },
        },
        MuiTextField: {
          styleOverrides: {
            root: {
              '& .MuiOutlinedInput-root': {
                borderRadius: 10,
                backgroundColor: '#FFFFFF',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: '#F8FAFC',
                },
                '&.Mui-focused': {
                  backgroundColor: '#FFFFFF',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderWidth: 2,
                  },
                },
              },
            },
          },
        },
        MuiAppBar: {
          styleOverrides: {
            root: {
              background: 'linear-gradient(135deg, #005A9E 0%, #0078D4 100%)',
              boxShadow: '0px 2px 8px rgba(0, 120, 212, 0.15)',
            },
          },
        },
        MuiTableHead: {
          styleOverrides: {
            root: {
              backgroundColor: '#F8FAFC',
              '& .MuiTableCell-head': {
                fontWeight: 600,
                color: '#475569',
                textTransform: 'uppercase',
                fontSize: '0.75rem',
                letterSpacing: '0.05em',
              },
            },
          },
        },
        MuiTableRow: {
          styleOverrides: {
            root: {
              '&:hover': {
                backgroundColor: '#F8FAFC',
              },
            },
          },
        },
        MuiTooltip: {
          styleOverrides: {
            tooltip: {
              backgroundColor: '#1E293B',
              fontSize: '0.8125rem',
              borderRadius: 8,
              padding: '8px 12px',
            },
            arrow: {
              color: '#1E293B',
            },
          },
        },
        MuiLinearProgress: {
          styleOverrides: {
            root: {
              borderRadius: 8,
              height: 8,
              backgroundColor: '#E2E8F0',
            },
            bar: {
              borderRadius: 8,
            },
          },
        },
      },
    }),
  []
);
const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 900px)');
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

 return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          
          {/* Mobile Drawer */}
          {isMobile && (
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{ keepMounted: true }}
              sx={{ '& .MuiDrawer-paper': { width: drawerWidth } }}
            >
              <NavBar onNavigate={() => setMobileOpen(false)} isMobile={isMobile} />
            </Drawer>
          )}

          {/* Desktop Sidebar */}
          
          {!isMobile && (
            <Box sx={{ width: drawerWidth, flexShrink: 0 }}>
              <NavBar />
            </Box>
          )}

          {/* Top Bar only for mobile */}
          {isMobile && (
            <AppBar position="fixed">
              <Toolbar>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
                <Typography
            variant='h6'
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent:'end'
            }}
          >
            <img
              src='/wizzgeeks.png'
              alt='logo'
              style={{
                width: '40px',
                height: '23px',
                verticalAlign: 'middle',
                marginRight: '10px',
              }}
            />
            Powered By Wizzgeeks
          </Typography>
              </Toolbar>
            </AppBar>
          )}

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              px: 3,
              pt: isMobile ? 10 : 3,
             height:{ xs: '100vh', sm: '100vh', md: 'unset' },
              overflowY: 'auto',
              overflowX: 'hidden',
              mt:{md:'64px'}
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/conversation" element={<ConversationView />} />
              <Route path="/missedclients" element={<MissedClients />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}


export default App;

