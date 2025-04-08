import React, { useState } from 'react';
import { styled, useTheme } from '@mui/material/styles';
import {
  Box,
  CssBaseline,
  AppBar as MuiAppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useMediaQuery,
  Tooltip,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Menu as MenuIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import NotificationMenu from '../notifications/NotificationMenu';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import Sidebar from './SideBar';

const drawerWidth = 280;

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up('md')]: {
      width: `calc(100% - ${drawerWidth}px)`,
      marginLeft: drawerWidth,
    },
  }),
  boxShadow: 'none',
  backdropFilter: 'blur(6px)',
  backgroundColor: 'rgba(255, 255, 255, 0.8)',
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const Main = styled('main', {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    [theme.breakpoints.up('md')]: {
      marginLeft: drawerWidth,
    },
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: theme.palette.background.default,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flex: 1,
  width: '100%',
  maxWidth: '100%',
  margin: '0 auto',
  padding: theme.spacing(2),
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(3),
  },
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.main,
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      content: '""',
    },
  },
}));

const MainLayout = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const handleProfileClick = () => {
    handleClose();
    navigate('/admin/profile');
  };

  // Générer les initiales du nom d'utilisateur
  const getInitials = () => {
    if (!currentUser) return 'U';
    
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName.charAt(0)}${currentUser.lastName.charAt(0)}`;
    }
    
    return currentUser.username.charAt(0).toUpperCase();
  };

  // Formater le nom d'affichage de l'utilisateur
  const getDisplayName = () => {
    if (!currentUser) return 'Utilisateur';
    
    if (currentUser.firstName && currentUser.lastName) {
      return `${currentUser.firstName} ${currentUser.lastName}`;
    }
    
    return currentUser.username;
  };

  // Rôle formaté pour l'affichage
  const getRoleDisplay = () => {
    if (!currentUser) return '';
    
    const roleLabels = {
      superAdmin: 'Super Admin',
      productManager: 'Responsable produits',
      orderManager: 'Responsable commandes',
      contentEditor: 'Éditeur de contenu'
    };
    
    return roleLabels[currentUser.role] || currentUser.role;
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" open={!isMobile && mobileOpen}>
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
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Dashboard Admin
          </Typography>
          
          {/* Notifications */}
          <Box sx={{ mr: 1 }}>
            <NotificationMenu />
          </Box>
          
          {/* Menu utilisateur */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            {!isMobile && (
              <Box sx={{ mr: 2, textAlign: 'right' }}>
                <Typography variant="subtitle2" component="div">
                  {getDisplayName()}
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  {getRoleDisplay()}
                </Typography>
              </Box>
            )}
            
            <Tooltip title="Paramètres du compte">
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <StyledBadge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  variant="dot"
                >
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {getInitials()}
                  </Avatar>
                </StyledBadge>
              </IconButton>
            </Tooltip>
            
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              sx={{
                '& .MuiPaper-root': {
                  borderRadius: 2,
                  minWidth: 180,
                  boxShadow: '0px 4px 20px rgba(0,0,0,0.1)',
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {getDisplayName()}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {getRoleDisplay()}
                </Typography>
              </Box>
              <Divider />
              
              <MenuItem onClick={handleProfileClick} dense>
                <ListItemIcon>
                  <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Profil</ListItemText>
              </MenuItem>
              
              <MenuItem onClick={() => { handleClose(); navigate('/admin/settings'); }} dense>
                <ListItemIcon>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Paramètres</ListItemText>
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handleLogout} dense>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>Déconnexion</ListItemText>
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} drawerWidth={drawerWidth} />
      
      <Main open={!isMobile && mobileOpen}>
        <Toolbar /> {/* Pour compenser l'AppBar fixe */}
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </Main>
    </Box>
  );
};

export default MainLayout;