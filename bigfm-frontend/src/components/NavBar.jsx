import React, { useState } from 'react';
import { alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
const drawerWidth = 280;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
  // { id: 'upload', label: 'UploadData', icon: <UploadFileIcon /> },
  {
    id: 'missedclients',
    label: 'Missed Clients',
    icon: <PersonOffOutlinedIcon />,
  },
    { id: 'conversation', label: 'Conversation AI', icon: <ChatOutlinedIcon /> },

];

function NavBar({onNavigate, isMobile}) {
  const nav = useNavigate();
  const path = window.location.pathname.split('/')[1];
  const [active, setActive] = useState(path.length ? path : 'dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState(!isMobile);
  
  const handleNavClick = (id) => {
    if(onNavigate) {
      onNavigate()
    }
    setActive(id);
    nav(`/${id}`);
    if (isMobile) {
      setIsDrawerOpen(false);
    }
  };

  const toggleDrawer = () => {
    setIsDrawerOpen(!isDrawerOpen);
  };

  return (
    <>
      <AppBar
        position='fixed'
        sx={(t) => ({
          zIndex: t.zIndex.drawer + 1,
          width: isMobile ? '100%' : `calc(100% - ${drawerWidth}px)`,
          ml: isMobile ? 0 : `${drawerWidth}px`,
          background: 'linear-gradient(117deg, #4a9cda 0%, #0179d6 100%)',
          color: '#fff !important',
          boxShadow: '0px 2px 8px rgba(0, 120, 212, 0.15)',
        })}
      >
        <Toolbar sx={{ 
          justifyContent: isMobile ? 'space-between' : 'flex-end',
          minHeight: '64px !important',
          px: isMobile ? 2 : 3
        }}>
          {isMobile && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <div 
                onClick={toggleDrawer}
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-around',
                  cursor: 'pointer',
                  zIndex: 1300
                }}
              >
                <span style={{
                  display: 'block',
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s ease-in-out',
                  transform: isDrawerOpen ? 'rotate(45deg) translate(6px, 5px)' : 'none',
                  opacity: isDrawerOpen ? 1 : 1
                }}></span>
                <span style={{
                  display: 'block',
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s ease-in-out',
                  opacity: isDrawerOpen ? 0 : 1,
                  transform: isDrawerOpen ? 'translateX(-20px)' : 'none'
                }}></span>
                <span style={{
                  display: 'block',
                  width: '100%',
                  height: '2px',
                  backgroundColor: '#fff',
                  transition: 'all 0.3s ease-in-out',
                  transform: isDrawerOpen ? 'rotate(-45deg) translate(6px, -5px)' : 'none',
                  opacity: isDrawerOpen ? 1 : 1
                }}></span>
              </div>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <img
                  src='/bigfmlogo.png'
                  alt='BigFM Logo'
                  style={{
                    width: '30px',
                    height: '30px',
                    objectFit: 'contain'
                  }}
                />
                <Typography 
                  variant="h6" 
                  sx={{ 
                    color: 'white',
                    fontWeight: 600,
                    fontSize: '1.1rem',
                    lineHeight: 1
                  }}
                >
                  BigFM
                </Typography>
              </Box>
            </Box>
          )}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <img
              src='/wizzgeeks.png'
              alt='Wizzgeeks Logo'
              style={{
                width: isMobile ? '35px' : '40px',
                height: isMobile ? '20px' : '23px',
                objectFit: 'contain',
              }}
            />
            {!isMobile && (
              <Typography
                variant='h6'
                sx={{
                  fontWeight: 700,
                  color: '#fff',
                  fontSize: isMobile ? '0.9rem' : '1rem',
                  whiteSpace: 'nowrap'
                }}
              >
                Powered By Wizzgeeks
              </Typography>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? isDrawerOpen : true}
        onClose={toggleDrawer}
        anchor='left'
        transitionDuration={300}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: 'transform 0.3s ease-in-out',
            transform: isMobile && !isDrawerOpen ? `translateX(-${drawerWidth}px)` : 'none',
            position: isMobile ? 'fixed' : 'relative',
            height: '100%',
            zIndex: 1200,
          },
        }}
      >
        <Toolbar sx={{ px: 2, gap: 1 }}>
          <img
            src='/bigfmlogo.png'
            alt='logo'
            style={{ width: '50px', height: '50px' }}
          />
          <Typography variant='h6'>BigFM</Typography>
          {/* <Chip label="Fuel Your Life" size="small" color="primary" variant="outlined" /> */}
        </Toolbar>
        <Divider />
        <List sx={{ px: 1.5, py: 1.5 }}>
          {navItems.map((item) => (
            <ListItem key={item.id} disablePadding>
              <ListItemButton
                selected={active === item.id}
                onClick={() => handleNavClick(item.id)}
                sx={(t) => ({
                  mx: 0.5,
                  mb: 0.5,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: alpha(t.palette.primary.main, 0.08),
                  },
                  ...(active === item.id && {
                    backgroundColor: alpha(t.palette.primary.main, 0.12),
                    '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                      color: t.palette.primary.main,
                    },
                  }),
                })}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}

export default NavBar;
