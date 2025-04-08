import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box,
  IconButton,
  Badge
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { 
  ShoppingCart as CartIcon,
  Search as SearchIcon
} from '@mui/icons-material';

const Header = () => {
  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component={RouterLink}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit'
          }}
        >
          Mon E-commerce
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <IconButton color="inherit" component={RouterLink} to="/search">
            <SearchIcon />
          </IconButton>
          <IconButton color="inherit" component={RouterLink} to="/cart">
            <Badge badgeContent={0} color="error">
              <CartIcon />
            </Badge>
          </IconButton>
          <Button color="inherit" component={RouterLink} to="/login">
            Connexion
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 