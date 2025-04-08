import React, { useState, useEffect } from 'react';
import {
  AppBar, Toolbar, Typography, Button, Container, Box,
  IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon,
  InputBase, alpha, styled, useMediaQuery, useTheme,
  Tooltip, Badge
} from '@mui/material';
import logo from '../../../logo.png'
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  Category as CategoryIcon,
  Store as StoreIcon,
  Close as CloseIcon,
  AccountCircle as ProfileIcon,
  ShoppingCart as CartIcon,
  Favorite as WishlistIcon,
  Inventory as ProductsIcon // Add this line
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../../../shared/contexts/CartContext';
import { useWishlist } from '../../../shared/contexts/WishlistContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
  transition: 'all 0.3s ease',
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const AnimatedAppBar = motion(AppBar);

const Navbar = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  
  const { getCartCount } = useCart();
  const { getWishlistCount } = useWishlist();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') {
      navigate(`/search?q=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const menuItems = [
    { text: 'Accueil', icon: <HomeIcon />, path: '/' },
    { text: 'Produits', icon: <ProductsIcon />, path: '/products' }, // Add this line
    { text: 'Catégories', icon: <CategoryIcon />, path: '/categories' },
    { text: 'Marques', icon: <StoreIcon />, path: '/companies' },
  ];

  return (
    <>
      <AnimatedAppBar 
        position="fixed" 
        initial={false}
        animate={{
          backgroundColor: isScrolled ? theme.palette.primary.main : '48cae4',
          boxShadow: isScrolled ? theme.shadows[4] : 'none'
        }}
        sx={{
          backdropFilter: isScrolled ? 'none' : 'blur(10px)',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters>
            {isMobile && (
              <Tooltip title="Menu">
                <IconButton
                  size="large"
                  edge="start"
                  color="inherit"
                  aria-label="menu"
                  onClick={handleDrawerToggle}
                  sx={{ 
                    mr: 2,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'rotate(90deg)'
                    }
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            )}
            
            <Typography
              variant="h5"
              component={RouterLink}
              to="/"
              sx={{
                flexGrow: 1,
                textDecoration: 'none',
                color: 'white',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                transition: 'transform 0.3s ease',
                '&:hover': {
                  transform: 'scale(1.05)'
                }
              }}
            >
              <Toolbar>
        {/* Remplacez le texte par votre logo */}
        <img 
          src={logo} // ou {logoPath} si dans public
          alt="Mauristock Logo" 
          height="40" // Ajustez la taille selon vos besoins
          style={{ marginRight: '10px' }} 
        />
        
        {/* Gardez le nom à côté si nécessaire, ou supprimez */}
        <Typography variant="h6">Mauristock</Typography>
        
        {/* Reste de votre navbar */}
      </Toolbar>

            </Typography>
            
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {menuItems.map((item) => (
                  <Button
                    key={item.text}
                    component={RouterLink}
                    to={item.path}
                    color="inherit"
                    sx={{ 
                      mx: 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.common.white, 0.15)
                      }
                    }}
                  >
                    {item.icon}
                    <Box sx={{ ml: 1 }}>{item.text}</Box>
                  </Button>
                ))}
              </Box>
            )}
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Search>
                <SearchIconWrapper>
                  <SearchIcon />
                </SearchIconWrapper>
                <StyledInputBase
                  placeholder="Rechercher..."
                  inputProps={{ 'aria-label': 'rechercher' }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearch}
                />
              </Search>

              <Tooltip title="Liste de souhaits">
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/wishlist"
                  sx={{
                    ml: 1,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      color: 'primary.light'
                    }
                  }}
                >
                  <Badge badgeContent={getWishlistCount()} color="error">
                    <WishlistIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Panier">
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/cart"
                  sx={{
                    ml: 1,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      color: 'primary.light'
                    }
                  }}
                >
                  <Badge badgeContent={getCartCount()} color="error">
                    <CartIcon />
                  </Badge>
                </IconButton>
              </Tooltip>

              <Tooltip title="Mon Profil">
                <IconButton
                  color="inherit"
                  component={RouterLink}
                  to="/profile"
                  sx={{
                    ml: 1,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      color: 'primary.light'
                    }
                  }}
                >
                  <ProfileIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Toolbar>
        </Container>
      </AnimatedAppBar>
      
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        sx={{
          '& .MuiDrawer-paper': {
            backgroundColor: theme.palette.background.default,
            width: 250,
          }
        }}
      >
        <Box role="presentation">
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <Tooltip title="Fermer">
              <IconButton onClick={handleDrawerToggle}>
                <CloseIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <List>
            {menuItems.map((item) => (
              <motion.div
                key={item.text}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ListItem 
                  button 
                  component={RouterLink} 
                  to={item.path}
                  onClick={handleDrawerToggle}
                  sx={{
                    transition: 'background-color 0.3s ease',
                    '&:hover': {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1)
                    }
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItem>
              </motion.div>
            ))}
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ListItem 
                button 
                component={RouterLink} 
                to="/wishlist"
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <Badge badgeContent={getWishlistCount()} color="error">
                    <WishlistIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Liste de souhaits" />
              </ListItem>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <ListItem 
                button 
                component={RouterLink} 
                to="/cart"
                onClick={handleDrawerToggle}
              >
                <ListItemIcon>
                  <Badge badgeContent={getCartCount()} color="error">
                    <CartIcon />
                  </Badge>
                </ListItemIcon>
                <ListItemText primary="Panier" />
              </ListItem>
            </motion.div>
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Navbar;