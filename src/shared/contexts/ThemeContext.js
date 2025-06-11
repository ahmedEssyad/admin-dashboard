import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Vérifier si le mode sombre est dans le localStorage ou préféré par l'utilisateur
  const prefersDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const storedTheme = localStorage.getItem('theme');
  const initialMode = storedTheme ? storedTheme === 'dark' : prefersDarkMode;

  const [darkMode, setDarkMode] = useState(initialMode);

  // Mettre à jour le localStorage quand le thème change
  useEffect(() => {
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
    // Ajouter/supprimer une classe sur le body pour les styles CSS globaux si nécessaire
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  // Écouter les changements de préférence du système
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      // Ne mettre à jour que si l'utilisateur n'a pas explicitement choisi un thème
      if (!localStorage.getItem('theme')) {
        setDarkMode(mediaQuery.matches);
      }
    };

    // Ajouter l'écouteur d'événements
    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Fallback pour les anciens navigateurs
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <ThemeContext.Provider value={{ darkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
