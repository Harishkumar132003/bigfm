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
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import { useNavigate } from 'react-router-dom';
const drawerWidth = 280;

const navItems = [
    { id: 'upload', label: 'UploadData', icon: <DashboardOutlinedIcon /> },
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardOutlinedIcon /> },
    { id: 'conversation', label: 'Conversation AI', icon: <ChatOutlinedIcon /> },
];

function NavBar() {
    const nav = useNavigate();
      const [active, setActive] = useState('dashboard');
      const handleNavClick = (id) => {
          setActive(id);
          nav(`/${id}`);
      }

    return (
        <>
            <AppBar
                position="fixed"
                sx={(t) => ({
                    zIndex: t.zIndex.drawer + 1,
                    width: `calc(100% - ${drawerWidth}px)`,
                    ml: `${drawerWidth}px`,
                    background: 'linear-gradient(135deg, #7C3AED 0%, #06B6D4 100%)',
                    color: '#fff',
                })}
            >
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        BigFM — AI Hub
                    </Typography>
                </Toolbar>
            </AppBar>

            <Drawer
                variant="permanent"
                anchor="left"
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
                    <Typography variant="h6">BigFM</Typography>
                    <Chip label="Desktop" size="small" color="primary" variant="outlined" />
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
