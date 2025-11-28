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
import  UploadData  from './components/uploadData';
import ConversationView from './components/chatPage';

const drawerWidth = 280;

function App() {
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: 'light',
          primary: { main: '#7C3AED' },
          secondary: { main: '#06B6D4' },
          background: { default: '#F8FAFC', paper: '#FFFFFF' },
        },
        shape: { borderRadius: 12 },
        typography: {
          fontFamily: [
            'Inter',
            'Roboto',
            'Helvetica Neue',
            'Arial',
            'sans-serif',
          ].join(','),
          h6: { fontWeight: 700 },
        },
      }),
    []
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
          <NavBar  />

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              ml: `${drawerWidth}px`,
              px: 3,
              pt: 10,
              pb: 6,
              height: '100vh',
              overflow: 'auto',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/upload" element={<UploadData />} />
              <Route path="/conversation" element={<ConversationView />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}


export default App;

