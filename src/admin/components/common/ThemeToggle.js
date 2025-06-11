import React from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme } from '../../../shared/contexts/ThemeContext';

const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useTheme();

  return (
    <Tooltip title={darkMode ? "Passer au mode clair" : "Passer au mode sombre"}>
      <IconButton 
        onClick={toggleTheme} 
        color="inherit" 
        aria-label="toggle theme"
        edge="end"
        sx={{ ml: 1 }}
      >
        {darkMode ? <Brightness7 /> : <Brightness4 />}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle;
