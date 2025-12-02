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
const drawerWidth = 280;

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
  { id: 'upload', label: 'UploadData', icon: <UploadFileIcon /> },
  { id: 'conversation', label: 'Conversation AI', icon: <ChatOutlinedIcon /> },
  {
    id: 'missedclients',
    label: 'Missed Clients',
    icon: <PersonOffOutlinedIcon />,
  },
];

function NavBar() {
  const nav = useNavigate();
  const path = window.location.pathname.split('/')[1];
  const [active, setActive] = useState(path.length ? path : 'dashboard');
  const handleNavClick = (id) => {
    setActive(id);
    nav(`/${id}`);
  };

  return (
    <>
      <AppBar
        position='fixed'
        sx={(t) => ({
          zIndex: t.zIndex.drawer + 1,
          width: `calc(100% - ${drawerWidth}px)`,
          ml: `${drawerWidth}px`,
          background: 'linear-gradient(117deg, #4a9cda 0%, #0179d6 100%)',
          color: '#fff !important',
          boxShadow: '0px 2px 8px rgba(0, 120, 212, 0.15)',
        })}
      >
        <Toolbar>
          <Typography
            variant='h6'
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
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

      <Drawer
        variant='permanent'
        anchor='left'
        PaperProps={{
          sx: (t) => ({
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: '1px solid',
            borderColor: 'divider',
            background: t.palette.background.paper,
          }),
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
